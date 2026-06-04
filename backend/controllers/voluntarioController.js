// conexão com banco de dados
const pool = require("../config/db");


// ======================================
// CADASTRAR PERFIL DE VOLUNTÁRIO
// ======================================
exports.cadastrarVoluntario = async (req, res) => {
  const usuarioId = req.usuario.id;

  let {
    nome,
    telefone,
    email,
    cidade,
    habilidades,
    disponibilidade,
    experiencia,
    observacao
  } = req.body;

  try {
    if (!nome || !telefone || !cidade || !disponibilidade) {
      return res.status(400).json({
        erro: "Nome, telefone, cidade e disponibilidade são obrigatórios"
      });
    }

    nome = nome.trim();
    telefone = telefone.trim();
    cidade = cidade.trim();
    disponibilidade = disponibilidade.trim();

    email = email ? email.trim() : null;
    habilidades = habilidades ? habilidades.trim() : null;
    experiencia = experiencia ? experiencia.trim() : null;
    observacao = observacao ? observacao.trim() : null;

    const existe = await pool.query(
      `SELECT id
       FROM voluntarios
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({
        erro: "Usuário já possui cadastro de voluntário"
      });
    }

    const result = await pool.query(
      `INSERT INTO voluntarios
      (
        usuario_id,
        nome,
        telefone,
        email,
        cidade,
        habilidades,
        disponibilidade,
        experiencia,
        observacao,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'ativo')
      RETURNING *`,
      [
        usuarioId,
        nome,
        telefone,
        email,
        cidade,
        habilidades,
        disponibilidade,
        experiencia,
        observacao
      ]
    );

    res.status(201).json({
      msg: "Voluntário cadastrado com sucesso",
      voluntario: result.rows[0]
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      erro: "Erro ao cadastrar voluntário"
    });
  }
};


// ======================================
// BUSCAR PERFIL DO VOLUNTÁRIO
// ======================================
exports.buscarMeuPerfil = async (req, res) => {

  const usuarioId = req.usuario.id;

  console.log("USUARIO LOGADO:", usuarioId);

  try {

    const result = await pool.query(
      `SELECT *
       FROM voluntarios
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    console.log("RESULTADO QUERY:", result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({
        erro: "Perfil não encontrado"
      });
    }

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: "Erro ao buscar perfil"
    });
  }
};