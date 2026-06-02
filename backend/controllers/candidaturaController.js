// conexão com o banco de dados
const pool = require("../config/db");


// ======================================
// CADASTRAR CANDIDATURA
// ======================================
exports.criarCandidatura = async (req, res) => {

  // id do usuário obtido através do token JWT
  const usuarioId = req.usuario.id;

  // centro escolhido pelo usuário
  const { centro_id } = req.body;

  try {

      const candidaturaExiste = await pool.query(
  `SELECT id
   FROM candidaturas
   WHERE usuario_id = $1
   AND centro_id = $2`,
  [usuarioId, centro_id]
);

console.log("CANDIDATURA EXISTE:", candidaturaExiste.rows);

if (candidaturaExiste.rows.length > 0) {
  return res.status(400).json({
    erro: "Você já se candidatou para este centro"
  });
}

    // verifica se o centro existe no banco
    const centro = await pool.query(
      "SELECT id FROM centros WHERE id = $1",
      [centro_id]
    );

    // se não existir, retorna erro
    if (centro.rows.length === 0) {
      return res.status(404).json({
        erro: "Centro não encontrado"
      });
    }

    // cria a candidatura
    const result = await pool.query(
      `INSERT INTO candidaturas
      (usuario_id, centro_id)
      VALUES ($1, $2)
      RETURNING *`,
      [usuarioId, centro_id]
    );

    // retorna sucesso
    res.status(201).json({
      msg: "Candidatura realizada com sucesso",
      candidatura: result.rows[0]
    });

  } catch (err) {

    // erro interno do servidor
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

    // busca todas as candidaturas
    // juntamente com os dados do usuário
    // e do centro relacionado
    const result = await pool.query(`
      SELECT
        c.id,
        c.status,
        c.data_candidatura,

        u.id as usuario_id,
        u.nome as usuario_nome,
        u.email,

        ce.id as centro_id,
        ce.nome as centro_nome,
        ce.cidade

      FROM candidaturas c

      JOIN usuarios u
        ON u.id = c.usuario_id

      JOIN centros ce
        ON ce.id = c.centro_id

      ORDER BY c.data_candidatura DESC
    `);

    // retorna lista de candidaturas
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

  // id da candidatura recebido pela URL
  const { id } = req.params;

  // novo status enviado pelo frontend
  const { status } = req.body;

  // status permitidos pelo sistema
  const statusValidos = [
    "pendente",
    "aprovada",
    "rejeitada"
  ];

  try {

    // valida se o status informado é válido
    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        erro: "Status inválido"
      });
    }

    // atualiza o status da candidatura
    const result = await pool.query(
      `UPDATE candidaturas
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    // verifica se a candidatura existe
    if (result.rows.length === 0) {
      return res.status(404).json({
        erro: "Candidatura não encontrada"
      });
    }

    // retorna candidatura atualizada
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