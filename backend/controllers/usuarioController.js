// conexão com banco de dados
const pool = require("../config/db");

// biblioteca para criptografar senha
const bcrypt = require("bcrypt");

// biblioteca para gerar token
const jwt = require("jsonwebtoken");


// ===============================
// CADASTRO DE USUÁRIO
// ===============================
exports.cadastrarUsuario = async (req, res) => {
  let { nome, email, senha, cidade } = req.body;

  try {
    if (!nome || !email || !senha || !cidade) {
      return res.status(400).json({
        erro: "Preencha todos os campos"
      });
    }

    if (
      typeof nome !== "string" ||
      typeof email !== "string" ||
      typeof senha !== "string" ||
      typeof cidade !== "string"
    ) {
      return res.status(400).json({
        erro: "Dados inválidos"
      });
    }

    nome = nome.trim();
    email = email.trim().toLowerCase();
    cidade = cidade.trim();

    if (senha.length < 6) {
      return res.status(400).json({
        erro: "Senha deve ter no mínimo 6 caracteres"
      });
    }

    const existe = await pool.query(
      `SELECT id
       FROM usuarios
       WHERE email = $1`,
      [email]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({
        erro: "Email já cadastrado"
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, cidade)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, cidade`,
      [nome, email, senhaHash, cidade]
    );

    res.status(201).json({
      msg: "Usuário cadastrado com sucesso",
      usuario: result.rows[0]
    });

  } catch (erro) {
    console.error("Erro no cadastro:", erro);

    res.status(500).json({
      erro: "Erro no servidor"
    });
  }
};


// ===============================
// LOGIN DE USUÁRIO
// ===============================
exports.loginUsuario = async (req, res) => {
  let { email, senha } = req.body;

  try {
    if (!email || !senha) {
      return res.status(400).json({
        erro: "Preencha email e senha"
      });
    }

    if (typeof email !== "string" || typeof senha !== "string") {
      return res.status(400).json({
        erro: "Dados inválidos"
      });
    }

    email = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT *
       FROM usuarios
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        erro: "Usuário não encontrado"
      });
    }

    const usuario = result.rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({
        erro: "Senha inválida"
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email
      },
      "segredo",
      {
        expiresIn: "1d"
      }
    );

    res.json({
      msg: "Login realizado com sucesso",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cidade: usuario.cidade
      }
    });

  } catch (erro) {
    console.error("Erro no login:", erro);

    res.status(500).json({
      erro: "Erro no servidor"
    });
  }
};


// ===============================
// BUSCAR PERFIL DO USUÁRIO LOGADO
// ===============================
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
      return res.status(404).json({
        erro: "Usuário não encontrado"
      });
    }

    res.json(result.rows[0]);

  } catch (erro) {
    console.error("Erro ao buscar perfil:", erro);

    res.status(500).json({
      erro: "Erro ao buscar perfil"
    });
  }
};


// ===============================
// ATUALIZAR PERFIL DO USUÁRIO LOGADO
// ===============================
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
      return res.status(404).json({
        erro: "Usuário não encontrado"
      });
    }

    const usuarioAtual = usuarioResult.rows[0];

    nome = nome && typeof nome === "string"
      ? nome.trim()
      : usuarioAtual.nome;

    email = email && typeof email === "string"
      ? email.trim().toLowerCase()
      : usuarioAtual.email;

    cidade = cidade && typeof cidade === "string"
      ? cidade.trim()
      : usuarioAtual.cidade;

    if (!nome || !email || !cidade) {
      return res.status(400).json({
        erro: "Nome, email e cidade são obrigatórios"
      });
    }

    if (email !== usuarioAtual.email) {
      const emailExiste = await pool.query(
        `SELECT id
         FROM usuarios
         WHERE email = $1
         AND id <> $2`,
        [email, usuarioId]
      );

      if (emailExiste.rows.length > 0) {
        return res.status(400).json({
          erro: "Email já cadastrado"
        });
      }
    }

    let senhaFinal = usuarioAtual.senha;

    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({
          erro: "Informe a senha atual para alterar a senha"
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          erro: "Nova senha deve ter no mínimo 6 caracteres"
        });
      }

      const senhaValida = await bcrypt.compare(
        senhaAtual,
        usuarioAtual.senha
      );

      if (!senhaValida) {
        return res.status(400).json({
          erro: "Senha atual inválida"
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
    console.error("Erro ao atualizar perfil:", erro);

    res.status(500).json({
      erro: "Erro ao atualizar perfil"
    });
  }
};