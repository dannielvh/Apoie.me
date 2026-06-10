// conexão com o banco de dados
const pool = require("../config/db");


// ======================================
// CADASTRAR CANDIDATURA
// ======================================
exports.criarCandidatura = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { centro_id } = req.body;

  try {
    if (!centro_id) {
      return res.status(400).json({
        erro: "Centro de apoio é obrigatório"
      });
    }

    // Verifica se o usuário possui perfil de voluntário
    const perfilVoluntario = await pool.query(
      `SELECT id
       FROM voluntarios
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (perfilVoluntario.rows.length === 0) {
      return res.status(400).json({
        erro: "Você precisa cadastrar seu perfil de voluntário antes de se candidatar"
      });
    }

    // Verifica se o centro existe
    const centro = await pool.query(
      `SELECT id, status
       FROM centros
       WHERE id = $1`,
      [centro_id]
    );

    if (centro.rows.length === 0) {
      return res.status(404).json({
        erro: "Centro não encontrado"
      });
    }

    // Opcional: só permite candidatura para centro aprovado
    if (centro.rows[0].status && centro.rows[0].status !== "aprovado") {
      return res.status(400).json({
        erro: "Este centro ainda não está disponível para receber candidaturas"
      });
    }

    // Verifica se já existe candidatura para o mesmo centro
    const candidaturaExiste = await pool.query(
      `SELECT id
       FROM candidaturas
       WHERE usuario_id = $1
       AND centro_id = $2`,
      [usuarioId, centro_id]
    );

    if (candidaturaExiste.rows.length > 0) {
      return res.status(400).json({
        erro: "Você já se candidatou para este centro"
      });
    }

    // Cria a candidatura
    const result = await pool.query(
      `INSERT INTO candidaturas
      (usuario_id, centro_id, status)
      VALUES ($1, $2, 'pendente')
      RETURNING *`,
      [usuarioId, centro_id]
    );

    res.status(201).json({
      msg: "Candidatura realizada com sucesso",
      candidatura: result.rows[0]
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      erro: "Erro ao criar candidatura"
    });
  }
};


// ======================================
// LISTAR CANDIDATURAS
// ======================================
exports.listarCandidaturas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.status,
        c.data_candidatura,

        u.id AS usuario_id,
        u.nome AS usuario_nome,
        u.email AS usuario_email,

        v.id AS voluntario_id,
        v.nome AS voluntario_nome,
        v.telefone,
        v.email AS voluntario_email,
        v.cidade AS voluntario_cidade,
        v.habilidades,
        v.disponibilidade,
        v.experiencia,
        v.observacao,
        v.status AS voluntario_status,

        ce.id AS centro_id,
        ce.nome AS centro_nome,
        ce.cidade AS centro_cidade

      FROM candidaturas c

      JOIN usuarios u
        ON u.id = c.usuario_id

      LEFT JOIN voluntarios v
        ON v.usuario_id = u.id

      JOIN centros ce
        ON ce.id = c.centro_id

      ORDER BY c.data_candidatura DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      erro: "Erro ao listar candidaturas"
    });
  }
};


// ======================================
// ATUALIZAR STATUS DA CANDIDATURA
// ======================================
exports.atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const statusValidos = [
    "pendente",
    "aprovada",
    "rejeitada"
  ];

  try {
    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        erro: "Status inválido"
      });
    }

    const result = await pool.query(
      `UPDATE candidaturas
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        erro: "Candidatura não encontrada"
      });
    }

    res.json({
      msg: "Status atualizado",
      candidatura: result.rows[0]
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      erro: "Erro ao atualizar status"
    });
  }
};