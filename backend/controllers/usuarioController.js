// conexão com banco de dados
const pool = require("../config/db");

// biblioteca para criptografar senha
const bcrypt = require("bcrypt");

// biblioteca para gerar token (login)
const jwt = require("jsonwebtoken");


// ===============================
// CADASTRO DE USUÁRIO
// ===============================
exports.cadastrarUsuario = async (req, res) => {

  // pega dados enviados pelo frontend (JSON)
  const { nome, email, senha, cidade } = req.body;

  try {

    // validação: campos obrigatórios
    if (!nome || !email || !senha || !cidade) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Preencha todos os campos",
        dados: null
      });
    }

    // validação: tipo dos dados
    if (
      typeof nome !== "string" ||
      typeof email !== "string" ||
      typeof senha !== "string" ||
      typeof cidade !== "string"
    ) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Dados inválidos",
        dados: null
      });
    }

    // validação: tamanho mínimo da senha
    if (senha.length < 6) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Senha deve ter no mínimo 6 caracteres",
        dados: null
      });
    }

    // OBS: A tabela "usuarios" ainda não existe no banco atual.
    // Futuramente:
    // - Criar tabela usuarios
    // OU
    // - Usar tabela "voluntario" adicionando coluna "senha"

    // verifica se já existe usuário com esse email
    const existe = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Email já cadastrado",
        dados: null
      });
    }

    // criptografa a senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // insere usuário no banco
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, cidade)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, cidade`,
      [nome, email, senhaHash, cidade]
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: "Usuário cadastrado com sucesso",
      dados: result.rows[0]
    });

  } catch (erro) {

    console.error("Erro no cadastro:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro no servidor",
      dados: null
    });
  }
};


// ===============================
// LOGIN DE USUÁRIO
// ===============================
exports.loginUsuario = async (req, res) => {

  const { email, senha } = req.body;

  try {

    // validação básica
    if (!email || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Preencha email e senha",
        dados: null
      });
    }

    // validação de tipo
    if (typeof email !== "string" || typeof senha !== "string") {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Dados inválidos",
        dados: null
      });
    }

    // OBS: Depende da existência da tabela "usuarios"
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Usuário não encontrado",
        dados: null
      });
    }

    const usuario = result.rows[0];

    // valida senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Senha inválida",
        dados: null
      });
    }

    // OBS: O campo "id" pode mudar dependendo da estrutura final do banco
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      "segredo", // depois ideal mover para .env
      { expiresIn: "1d" }
    );

    return res.json({
      sucesso: true,
      mensagem: "Login realizado com sucesso",
      dados: {
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          cidade: usuario.cidade,
        }
      }
    });

  } catch (erro) {

    console.error("Erro no login:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro no servidor",
      dados: null
    });
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
