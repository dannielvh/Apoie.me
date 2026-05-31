/*
  CONTROLLER DE VOLUNTÁRIOS

  Responsável por:
  - cadastrar candidatura de voluntário
  - listar voluntários disponíveis
  - buscar detalhes de um voluntário
  - permitir que um centro aprovado selecione um voluntário

  IMPORTANTE:
  Nesta primeira versão, algumas rotas ainda usam validações diretamente
  dentro do controller.

  Próximo passo recomendado:
  criar um middleware "verificarCentroAprovado" para centralizar a regra:

  usuário logado -> possui centro -> centro está aprovado

  Esse middleware deverá ser usado nas rotas do painel do centro, como:
  - listar voluntários
  - buscar detalhes do voluntário
  - selecionar voluntário
  - criar pedidos de doação
*/

const pool = require("../config/db");

// ===============================
// CADASTRAR CANDIDATURA DE VOLUNTÁRIO
// ===============================
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
    if (!nome || !telefone || !cidade) {
      return res.status(400).json({
        erro: "Nome, telefone e cidade são obrigatórios"
      });
    }

    nome = nome.trim();
    telefone = telefone.trim();
    cidade = cidade.trim();

    email = email ? email.trim() : null;
    habilidades = habilidades ? habilidades.trim() : null;
    disponibilidade = disponibilidade ? disponibilidade.trim() : null;
    experiencia = experiencia ? experiencia.trim() : null;
    observacao = observacao ? observacao.trim() : null;

    // Evita o mesmo usuário cadastrar várias candidaturas ativas
    const existe = await pool.query(
      `SELECT 1 FROM voluntarios
       WHERE usuario_id = $1
       AND status = 'ativo'`,
      [usuarioId]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({
        erro: "Você já possui uma candidatura ativa como voluntário"
      });
    }

    const result = await pool.query(
      `INSERT INTO voluntarios
       (usuario_id, nome, telefone, email, cidade, habilidades, disponibilidade, experiencia, observacao, status)
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
      msg: "Candidatura cadastrada com sucesso",
      voluntario: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao cadastrar voluntário" });
  }
};


// ===============================
// LISTAR VOLUNTÁRIOS
// ===============================
// TODO:
// Hoje qualquer usuário logado consegue listar voluntários.
// Futuramente, essa rota deve ser liberada apenas para responsáveis
// por centros de apoio aprovados.
//
// Melhor abordagem:
// criar middleware verificarCentroAprovado e aplicar na rota.
exports.listarVoluntarios = async (req, res) => {
  const { cidade, habilidade } = req.query;

  try {
    let query = `
      SELECT 
        id,
        nome,
        telefone,
        email,
        cidade,
        habilidades,
        disponibilidade,
        experiencia,
        observacao,
        status,
        criado_em
      FROM voluntarios
      WHERE status = 'ativo'
    `;

    const values = [];

    if (cidade) {
      values.push(`%${cidade.trim()}%`);
      query += `
        AND unaccent(lower(cidade))
        LIKE unaccent(lower($${values.length}))
      `;
    }

    if (habilidade) {
      values.push(`%${habilidade.trim()}%`);
      query += `
        AND unaccent(lower(habilidades))
        LIKE unaccent(lower($${values.length}))
      `;
    }

    query += ` ORDER BY criado_em DESC`;

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao listar voluntários" });
  }
};


// ===============================
// BUSCAR VOLUNTÁRIO POR ID
// ===============================
// TODO:
// Futuramente proteger esta rota para que apenas centros aprovados
// possam visualizar os detalhes completos de contato do voluntário.
//
// Motivo:
// telefone e email são dados sensíveis e não devem ficar abertos
// para qualquer usuário logado.
exports.buscarVoluntarioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const result = await pool.query(
      `SELECT 
        id,
        nome,
        telefone,
        email,
        cidade,
        habilidades,
        disponibilidade,
        experiencia,
        observacao,
        status,
        criado_em
       FROM voluntarios
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Voluntário não encontrado" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar voluntário" });
  }
};


// ===============================
// SELECIONAR VOLUNTÁRIO PARA UM CENTRO
// ===============================
exports.selecionarVoluntario = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;
  const { mensagem } = req.body;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ erro: "ID do voluntário inválido" });
    }

    // Busca o centro do usuário logado
    const centroResult = await pool.query(
      `SELECT id, status FROM centros
       WHERE usuario_id = $1
       LIMIT 1`,
      [usuarioId]
    );

    if (centroResult.rows.length === 0) {
      return res.status(403).json({
        erro: "Você não possui um centro cadastrado"
      });
    }

    const centro = centroResult.rows[0];

    if (centro.status !== "aprovado") {
      return res.status(403).json({
        erro: "Seu centro precisa estar aprovado para selecionar voluntários"
      });
    }

    // Verifica se voluntário existe
    const voluntarioResult = await pool.query(
      `SELECT 1 FROM voluntarios WHERE id = $1 AND status = 'ativo'`,
      [id]
    );

    if (voluntarioResult.rows.length === 0) {
      return res.status(404).json({
        erro: "Voluntário não encontrado ou inativo"
      });
    }

    // Evita selecionar o mesmo voluntário várias vezes para o mesmo centro
    const jaSelecionado = await pool.query(
      `SELECT 1 FROM voluntarios_selecionados
       WHERE voluntario_id = $1
       AND centro_id = $2`,
      [id, centro.id]
    );

    if (jaSelecionado.rows.length > 0) {
      return res.status(400).json({
        erro: "Esse voluntário já foi selecionado por este centro"
      });
    }

    const result = await pool.query(
      `INSERT INTO voluntarios_selecionados
       (voluntario_id, centro_id, status, mensagem)
       VALUES ($1,$2,'selecionado',$3)
       RETURNING *`,
      [id, centro.id, mensagem || null]
    );

    res.status(201).json({
      msg: "Voluntário selecionado com sucesso",
      selecao: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao selecionar voluntário" });
  }
};