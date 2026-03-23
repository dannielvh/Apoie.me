const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.cadastrarUsuario = async (req, res) => {
  const { nome, email, senha, cidade } = req.body;

  try {
    // 1. validação básica
    if (!nome || !email || !senha || !cidade) {
      return res.status(400).json({ msg: "Preencha todos os campos" });
    }

    if (senha.length < 6) {
      return res
        .status(400)
        .json({ msg: "Senha deve ter no mínimo 6 caracteres" });
    }

    // 2. verificar email duplicado
    const existe = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email],
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ msg: "Email já cadastrado" });
    }

    // 3. criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // 4. inserir no banco
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, cidade)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, cidade`,
      [nome, email, senhaHash, cidade],
    );

    // 5. resposta
    res.status(201).json({
      msg: "Usuário cadastrado com sucesso",
      usuario: result.rows[0],
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro no servidor" });
  }
};

exports.loginUsuario = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // 1. validação básica
    if (!email || !senha) {
      return res.status(400).json({ msg: "Preencha email e senha" });
    }

    // 2. buscar usuário
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ msg: "Usuário não encontrado" });
    }

    const usuario = result.rows[0];

    // 3. comparar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({ msg: "Senha inválida" });
    }

    // 4. gerar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      "segredo", // depois você coloca no .env
      { expiresIn: "1d" },
    );

    // 5. resposta
    res.json({
      msg: "Login realizado com sucesso",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cidade: usuario.cidade,
      },
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro no servidor" });
  }
};
