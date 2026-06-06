const pool = require('../config/db');

// 1. Listar todas as cidades para o select do front
exports.listarCidades = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM cidade ORDER BY nome_cidade ASC;'); // ajuste o nome da coluna se necessário
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar cidades.' });
  }
};

// 2. Carregamento dinâmico de centros por cidade
exports.listarCentrosPorCidade = async (req, res) => {
  const { id_cidade } = req.params;
  try {
    const resultado = await pool.query('SELECT * FROM centro WHERE id_cidade = $1;', [id_cidade]);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar centros de apoio.' });
  }
};

// 3. Enviar candidatura (salva na tabela voluntario/voluntariado)
exports.criarCandidatura = async (req, res) => {
  const { nome, email, telefone, id_centro, habilidades } = req.body;
  try {
    // Insere o voluntário e vincula ao centro escolhido
    const novaCandidatura = await pool.query(
      'INSERT INTO voluntario (nome, email, telefone, id_centro, habilidades, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
      [nome, email, telefone, id_centro, habilidades, 'Pendente']
    );
    res.status(201).json({ message: 'Candidatura enviada com sucesso!', dado: novaCandidatura.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao enviar candidatura.' });
  }
};

// 4. Visualização de candidaturas (com JOIN para mostrar o nome do centro)
exports.listarCandidaturas = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT v.*, c.nome as nome_centro 
      FROM voluntario v
      JOIN centro c ON v.id_centro = c.id_centro
      ORDER BY v.id_voluntario DESC;
    `);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar candidaturas.' });
  }
};