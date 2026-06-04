// conexão com banco de dados
const pool = require("../config/db");

// biblioteca para criptografar senha
const bcrypt = require("bcrypt");

// biblioteca para gerar token (login)
const jwt = require("jsonwebtoken");


// CADASTRO DE USUÁRIO
exports.cadastrarUsuario = async (req, res) => {

  // pega dados enviados pelo frontend (JSON)
  const { nome, email, senha, cidade } = req.body;

  try {

    // validação: campos obrigatórios
    if (!nome || !email || !senha || !cidade) {
      return res.status(400).json({ msg: "Preencha todos os campos" });
    }

    // validação: tamanho mínimo da senha
    if (senha.length < 6) {
      return res
        .status(400)
        .json({ msg: "Senha deve ter no mínimo 6 caracteres" });
    }

    // verifica se já existe usuário com esse email
    const existe = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1", // $1 evita SQL injection
      [email]
    );

    // se já existe, retorna erro
    if (existe.rows.length > 0) {
      return res.status(400).json({ msg: "Email já cadastrado" });
    }

    // criptografa a senha antes de salvar
    const senhaHash = await bcrypt.hash(senha, 10); // 10 = nível de segurança

    // insere usuário no banco
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, cidade)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, cidade`, // retorna dados sem a senha
      [nome, email, senhaHash, cidade]
    );

    // resposta de sucesso
    res.status(201).json({
      msg: "Usuário cadastrado com sucesso",
      usuario: result.rows[0], // dados do usuário criado
    });

  } catch (erro) {

    // erro interno do servidor
    console.error(erro);
    res.status(500).json({ erro: "Erro no servidor" });
  }
};


// LOGIN DE USUÁRIO
exports.loginUsuario = async (req, res) => {

  // pega email e senha enviados
  const { email, senha } = req.body;

  try {

    // validação básica
    if (!email || !senha) {
      return res.status(400).json({ msg: "Preencha email e senha" });
    }

    // busca usuário no banco pelo email
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    // se não encontrar usuário
    if (result.rows.length === 0) {
      return res.status(400).json({ msg: "Usuário não encontrado" });
    }

    // pega o usuário encontrado
    const usuario = result.rows[0];

    // compara senha digitada com senha criptografada
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    // se senha estiver errada
    if (!senhaValida) {
      return res.status(400).json({ msg: "Senha inválida" });
    }

    // gera token JWT (login)
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email }, // dados dentro do token
      "segredo", // chave secreta (depois vai pro .env)
      { expiresIn: "1d" } // tempo de expiração
    );

    // resposta de sucesso
    res.json({
      msg: "Login realizado com sucesso",
      token, // token usado para autenticação
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cidade: usuario.cidade,
      },
    });

  } catch (erro) {

    // erro interno
    console.error(erro);
    res.status(500).json({ erro: "Erro no servidor" });
  }
};

// BUSCAR PERFIL DO USUÁRIO LOGADO
exports.buscarMeuPerfil = async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const result = await pool.query(
      `SELECT id, nome, email, cidade
       FROM usuarios
       WHERE id = $1`,
      [usuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.json(result.rows[0]);

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar perfil" });
  }
};

// ATUALIZAR PERFIL DO USUÁRIO LOGADO
exports.atualizarMeuPerfil = async (req, res) => {
  const usuarioId = req.usuario.id;

  let {
    nome,
    email,
    cidade,
    senhaAtual,
    novaSenha
  } = req.body;

  try {
    const usuarioResult = await pool.query(
      `SELECT *
       FROM usuarios
       WHERE id = $1`,
      [usuarioId]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const usuarioAtual = usuarioResult.rows[0];

    nome = nome?.trim() || usuarioAtual.nome;
    email = email?.trim() || usuarioAtual.email;
    cidade = cidade?.trim() || usuarioAtual.cidade;

    // Se mudou email, verifica duplicidade
    if (email !== usuarioAtual.email) {
      const emailExiste = await pool.query(
        `SELECT id FROM usuarios
         WHERE email = $1
         AND id <> $2`,
        [email, usuarioId]
      );

      if (emailExiste.rows.length > 0) {
        return res.status(400).json({ erro: "Email já cadastrado" });
      }
    }

    let senhaFinal = usuarioAtual.senha;

    // Se quiser trocar senha
    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({
          erro: "Informe a senha atual para alterar a senha"
        });
      }

      const senhaValida = await bcrypt.compare(senhaAtual, usuarioAtual.senha);

      if (!senhaValida) {
        return res.status(400).json({ erro: "Senha atual inválida" });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          erro: "Nova senha deve ter no mínimo 6 caracteres"
        });
      }

      senhaFinal = await bcrypt.hash(novaSenha, 10);
    }

    const result = await pool.query(
      `UPDATE usuarios
       SET nome = $1,
           email = $2,
           cidade = $3,
           senha = $4
       WHERE id = $5
       RETURNING id, nome, email, cidade`,
      [nome, email, cidade, senhaFinal, usuarioId]
    );

    res.json({
      msg: "Perfil atualizado com sucesso",
      usuario: result.rows[0]
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao atualizar perfil" });
  }
};
