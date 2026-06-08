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
  };
};

//const pool = require('../config/db');

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