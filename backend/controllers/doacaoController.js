const jwt = require('jsonwebtoken');
const { centros, usuarios, doacoes, necessidades } = require('../db');
const { registrarUso, registrarErro } = require('../logger');

exports.listarNecessidades = (req, res) => {
  try {
    const resultado = necessidades.map((n) => {
      const centro = centros.find((c) => c.id === n.centroId);
      return {
        id: n.id,
        centroId: n.centroId,
        nomeCentro: centro ? centro.nome : "Centro não encontrado",
        item: n.item,
        categoria: n.categoria,
        quantidadeNecessaria: n.quantidadeNecessaria,
        quantidadeAtendida: n.quantidadeAtendida,
        urgencia: n.urgencia
      };
    });

    registrarUso(null, 'Listou necessidades');
    res.json({ sucesso: true, dados: resultado });
  } catch (err) {
    registrarErro(null, 'GET /necessidades', err.message);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
};

exports.criarDoacao = (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ sucesso: false, mensagem: 'Usuário não está logado.' });
    }

    const { necessidadeId, quantidade } = req.body;

    if (!necessidadeId || !quantidade) {
      return res.status(400).json({ sucesso: false, mensagem: 'Campos obrigatórios: necessidadeId, quantidade.' });
    }

    if (quantidade <= 0) {
      return res.status(400).json({ sucesso: false, mensagem: 'Quantidade deve ser maior que zero.' });
    }

    const necessidade = necessidades.find((n) => n.id === necessidadeId);
    if (!necessidade) {
      return res.status(404).json({ sucesso: false, mensagem: 'Necessidade não encontrada.' });
    }

    const falta = necessidade.quantidadeNecessaria - necessidade.quantidadeAtendida;
    if (quantidade > falta) {
      return res.status(400).json({ sucesso: false, mensagem: `Quantidade excede o necessário. Ainda faltam ${falta} unidades.` });
    }

    let usuarioId;
    try {
      const decoded = jwt.verify(token, 'segredo');
      usuarioId = decoded.id;
    } catch (err) {
      return res.status(401).json({ sucesso: false, mensagem: 'Token inválido ou expirado.' });
    }

    necessidade.quantidadeAtendida += quantidade;

    const novaDoacao = {
      id: doacoes.length + 1,
      usuarioId,
      centroId: necessidade.centroId,
      necessidadeId,
      item: necessidade.item,
      quantidade,
      unidade: 'unidades',
      criadoEm: new Date().toISOString(),
      status: 'pendente',
    };

    doacoes.push(novaDoacao);

    registrarUso(usuarioId, `Doou ${quantidade} unidades de "${necessidade.item}"`);
    res.status(201).json({ sucesso: true, dados: novaDoacao });
  } catch (err) {
    registrarErro(null, 'POST /doacoes', err.message);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
};
