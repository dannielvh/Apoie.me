// conexão com banco de dados
const pool = require("../config/db");


// ======================================
// LISTAR PEDIDOS DE DOAÇÃO / NECESSIDADES
// ======================================
exports.listarNecessidades = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.centro_id AS "centroId",

        c.nome AS "nomeCentro",
        c.cidade AS "centroCidade",
        c.rua AS "centroEndereco",
        c.telefone AS "centroTelefone",
        c.horario AS "centroHorario",

        p.titulo AS item,
        p.descricao,
        p.categoria,

        p.quantidade_necessaria AS "quantidadeNecessaria",
        p.quantidade_recebida AS "quantidadeAtendida",

        p.urgencia,
        p.status,
        p.criado_em AS "criadoEm",
        p.atualizado_em AS "atualizadoEm"

      FROM pedidos_doacao p

      JOIN centros c
        ON c.id = p.centro_id

      WHERE p.status <> 'cancelado'

      ORDER BY
        CASE p.urgencia
          WHEN 'critica' THEN 1
          WHEN 'alta' THEN 2
          WHEN 'media' THEN 3
          WHEN 'baixa' THEN 4
          ELSE 5
        END,
        p.criado_em DESC
    `);

    return res.json({
      sucesso: true,
      dados: result.rows
    });

  } catch (err) {
    console.error("Erro ao listar necessidades:", err);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      dados: null
    });
  }
};


// ======================================
// LISTAR PEDIDOS DO CENTRO LOGADO
// ======================================
exports.listarPedidosMeuCentro = async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const centroResult = await pool.query(
      `SELECT id
       FROM centros
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (centroResult.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Centro não encontrado para este usuário.",
        dados: null
      });
    }

    const centroId = centroResult.rows[0].id;

    const result = await pool.query(
      `
      SELECT
        id,
        centro_id AS "centroId",
        titulo AS item,
        descricao,
        categoria,
        quantidade_necessaria AS "quantidadeNecessaria",
        quantidade_recebida AS "quantidadeAtendida",
        urgencia,
        status,
        criado_em AS "criadoEm",
        atualizado_em AS "atualizadoEm"
      FROM pedidos_doacao
      WHERE centro_id = $1
      ORDER BY criado_em DESC
      `,
      [centroId]
    );

    return res.json({
      sucesso: true,
      dados: result.rows
    });

  } catch (err) {
    console.error("Erro ao listar pedidos do centro:", err);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      dados: null
    });
  }
};


// ======================================
// CRIAR PEDIDO DE DOAÇÃO
// antigo: criarDoacao
// ======================================
exports.criarDoacao = async (req, res) => {
  const usuarioId = req.usuario.id;

  let {
    titulo,
    item,
    descricao,
    categoria,
    quantidadeNecessaria,
    quantidade_necessaria,
    urgencia
  } = req.body;

  try {
    titulo = titulo || item;
    quantidadeNecessaria = quantidadeNecessaria || quantidade_necessaria;

    if (!titulo || !categoria || !quantidadeNecessaria) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Campos obrigatórios: título/item, categoria e quantidade necessária.",
        dados: null
      });
    }

    quantidadeNecessaria = Number(quantidadeNecessaria);

    if (isNaN(quantidadeNecessaria) || quantidadeNecessaria <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Quantidade necessária deve ser maior que zero.",
        dados: null
      });
    }

    urgencia = urgencia || "media";

    const urgenciasValidas = ["baixa", "media", "alta", "critica"];

    if (!urgenciasValidas.includes(urgencia)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Urgência inválida.",
        dados: null
      });
    }

    const centroResult = await pool.query(
      `SELECT id, status
       FROM centros
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (centroResult.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Centro não encontrado para este usuário.",
        dados: null
      });
    }

    const centro = centroResult.rows[0];

    if (centro.status !== "aprovado") {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Apenas centros aprovados podem criar pedidos de doação.",
        dados: null
      });
    }

    const result = await pool.query(
      `
      INSERT INTO pedidos_doacao
      (
        centro_id,
        titulo,
        descricao,
        categoria,
        quantidade_necessaria,
        quantidade_recebida,
        urgencia,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 0, $6, 'ativo')
      RETURNING *
      `,
      [
        centro.id,
        titulo.trim(),
        descricao ? descricao.trim() : null,
        categoria.trim(),
        quantidadeNecessaria,
        urgencia
      ]
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: "Pedido de doação criado com sucesso.",
      dados: result.rows[0]
    });

  } catch (err) {
    console.error("Erro ao criar pedido de doação:", err);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      dados: null
    });
  }
};


// ======================================
// EDITAR PEDIDO DE DOAÇÃO
// ======================================
exports.editarDoacao = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;

  let {
    titulo,
    item,
    descricao,
    categoria,
    quantidadeNecessaria,
    quantidade_necessaria,
    urgencia,
    status
  } = req.body;

  try {
    titulo = titulo || item;
    quantidadeNecessaria = quantidadeNecessaria || quantidade_necessaria;

    const centroResult = await pool.query(
      `SELECT id
       FROM centros
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (centroResult.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Centro não encontrado para este usuário.",
        dados: null
      });
    }

    const centroId = centroResult.rows[0].id;

    const pedidoResult = await pool.query(
      `SELECT *
       FROM pedidos_doacao
       WHERE id = $1
       AND centro_id = $2`,
      [id, centroId]
    );

    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Pedido não encontrado ou não pertence ao seu centro.",
        dados: null
      });
    }

    const pedidoAtual = pedidoResult.rows[0];

    const novoTitulo = titulo ? titulo.trim() : pedidoAtual.titulo;
    const novaDescricao = descricao !== undefined ? descricao : pedidoAtual.descricao;
    const novaCategoria = categoria ? categoria.trim() : pedidoAtual.categoria;
    const novaQuantidade = quantidadeNecessaria
      ? Number(quantidadeNecessaria)
      : pedidoAtual.quantidade_necessaria;

    const novaUrgencia = urgencia || pedidoAtual.urgencia;
    const novoStatus = status || pedidoAtual.status;

    if (novaQuantidade <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Quantidade necessária deve ser maior que zero.",
        dados: null
      });
    }

    if (pedidoAtual.quantidade_recebida > novaQuantidade) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "A quantidade necessária não pode ser menor que a quantidade já recebida.",
        dados: null
      });
    }

    const urgenciasValidas = ["baixa", "media", "alta", "critica"];
    const statusValidos = ["ativo", "atendido", "cancelado"];

    if (!urgenciasValidas.includes(novaUrgencia)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Urgência inválida.",
        dados: null
      });
    }

    if (!statusValidos.includes(novoStatus)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Status inválido.",
        dados: null
      });
    }

    const result = await pool.query(
      `
      UPDATE pedidos_doacao
      SET titulo = $1,
          descricao = $2,
          categoria = $3,
          quantidade_necessaria = $4,
          urgencia = $5,
          status = $6,
          atualizado_em = NOW()
      WHERE id = $7
      AND centro_id = $8
      RETURNING *
      `,
      [
        novoTitulo,
        novaDescricao,
        novaCategoria,
        novaQuantidade,
        novaUrgencia,
        novoStatus,
        id,
        centroId
      ]
    );

    return res.json({
      sucesso: true,
      mensagem: "Pedido atualizado com sucesso.",
      dados: result.rows[0]
    });

  } catch (err) {
    console.error("Erro ao editar pedido:", err);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      dados: null
    });
  }
};


// ======================================
// ATUALIZAR QUANTIDADE RECEBIDA
// ======================================
exports.atualizarRecebimento = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;
  const { quantidadeRecebida, quantidade_recebida } = req.body;

  try {
    const novaQuantidadeRecebida = Number(
      quantidadeRecebida || quantidade_recebida
    );

    if (isNaN(novaQuantidadeRecebida) || novaQuantidadeRecebida < 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Quantidade recebida inválida.",
        dados: null
      });
    }

    const centroResult = await pool.query(
      `SELECT id
       FROM centros
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (centroResult.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Centro não encontrado para este usuário.",
        dados: null
      });
    }

    const centroId = centroResult.rows[0].id;

    const pedidoResult = await pool.query(
      `SELECT *
       FROM pedidos_doacao
       WHERE id = $1
       AND centro_id = $2`,
      [id, centroId]
    );

    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Pedido não encontrado ou não pertence ao seu centro.",
        dados: null
      });
    }

    const pedido = pedidoResult.rows[0];

    if (novaQuantidadeRecebida > pedido.quantidade_necessaria) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Quantidade recebida não pode ser maior que a quantidade necessária.",
        dados: null
      });
    }

    const novoStatus =
      novaQuantidadeRecebida >= pedido.quantidade_necessaria
        ? "atendido"
        : "ativo";

    const result = await pool.query(
      `
      UPDATE pedidos_doacao
      SET quantidade_recebida = $1,
          status = $2,
          atualizado_em = NOW()
      WHERE id = $3
      AND centro_id = $4
      RETURNING *
      `,
      [
        novaQuantidadeRecebida,
        novoStatus,
        id,
        centroId
      ]
    );

    return res.json({
      sucesso: true,
      mensagem: "Quantidade recebida atualizada com sucesso.",
      dados: result.rows[0]
    });

  } catch (err) {
    console.error("Erro ao atualizar recebimento:", err);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      dados: null
    });
  }
};


// ======================================
// EXCLUIR / CANCELAR PEDIDO DE DOAÇÃO
// ======================================
exports.excluirDoacao = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;

  try {
    const centroResult = await pool.query(
      `SELECT id
       FROM centros
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (centroResult.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Centro não encontrado para este usuário.",
        dados: null
      });
    }

    const centroId = centroResult.rows[0].id;

    const result = await pool.query(
      `
      UPDATE pedidos_doacao
      SET status = 'cancelado',
          atualizado_em = NOW()
      WHERE id = $1
      AND centro_id = $2
      RETURNING *
      `,
      [id, centroId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Pedido não encontrado ou não pertence ao seu centro.",
        dados: null
      });
    }

    return res.json({
      sucesso: true,
      mensagem: "Pedido cancelado com sucesso.",
      dados: result.rows[0]
    });

  } catch (err) {
    console.error("Erro ao excluir pedido:", err);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      dados: null
    });
  }
};