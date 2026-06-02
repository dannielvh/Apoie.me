// conexão com banco de dados
const pool = require("../config/db");


// ======================================
// CADASTRAR PERFIL DE VOLUNTÁRIO
// ======================================
exports.cadastrarVoluntario = async (req, res) => {

  // usuário obtido através do token
  const usuarioId = req.usuario.id;

  const {
    telefone,
    disponibilidade,
    habilidades
  } = req.body;

  try {

    // validação básica
    if (!telefone || !disponibilidade) {
      return res.status(400).json({
        erro: "Telefone e disponibilidade são obrigatórios"
      });
    }

    // verifica se já possui perfil
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

    // cria perfil
    const result = await pool.query(
      `INSERT INTO voluntarios
      (
        usuario_id,
        telefone,
        disponibilidade,
        habilidades
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        usuarioId,
        telefone,
        disponibilidade,
        habilidades
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