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

const pool = require("../config/db");

/**
 * REGRA: Criar uma nova doação no sistema
 * Segurança implementada: Validação de tipos, valores lógicos e proteção contra Double Submit.
 */
exports.criarDoacao = async (req, res) => {
  // O 'valor' veio do esqueleto original do grupo. Mantido para consistência.
  const { valor } = req.body;
  
  // ID extraído de forma segura do Token JWT através do middleware 'autenticar'
  const usuario_id = req.usuario.id; 

  try {
    // 1. VALIDAÇÃO DE ENTRADA: Impede campos vazios ou formatos inesperados (Ex: strings ou objetos)
    if (!valor || typeof valor !== "number") {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Valor da doação é obrigatório e deve ser um número.",
        dados: null
      });
    }

    // 2. VALIDAÇÃO DE NEGÓCIO: Garante que o valor seja coerente (não permite doações negativas ou zeradas)
    if (valor <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "O valor da doação deve ser maior que zero.",
        dados: null
      });
    }

    // 3. DEFESA CONTRA DOUBLE SUBMIT (Clique Duplo):
    // Checa se o mesmo usuário tentou enviar exatamente o mesmo valor nos últimos 5 segundos.
    // Evita inserções duplicadas por lag na rede ou múltiplos cliques rápidos no botão do frontend.
    const doacaoDuplicada = await pool.query(
      `SELECT id FROM doacoes 
       WHERE usuario_id = $1 AND valor = $2 
       AND data_doacao > NOW() - INTERVAL '5 seconds'`,
      [usuario_id, valor]
    );

    if (doacaoDuplicada.rows.length > 0) {
      return res.status(409).json({ // 409: Conflict
        sucesso: false,
        mensagem: "Doação duplicada detectada. Por favor, aguarde um momento.",
        dados: null
      });
    }

    // 4. INSERÇÃO SEGURA: Uso de queries parametrizadas ($1, $2) para blindar contra SQL Injection
    const novaDoacao = await pool.query(
      `INSERT INTO doacoes (usuario_id, valor, data_doacao)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [usuario_id, valor]
    );

    // Retorno padronizado com o formato { sucesso, mensagem, dados }
    return res.status(201).json({
      sucesso: true,
      mensagem: "Doação realizada com sucesso",
      dados: novaDoacao.rows[0]
    });

  } catch (erro) {
    console.error("Erro ao criar doação:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno no servidor ao processar doação.",
      dados: null
    });
  }
};

/**
 * REGRA: Buscar histórico de doações de um usuário específico
 * Segurança implementada: Controle de Acesso Baseado no Usuário (Privacidade de Dados).
 */
exports.obterHistorico = async (req, res) => {
  const { idUsuario } = req.params; // ID enviado na rota/URL (/historico/5)
  const idLogado = req.usuario.id;   // ID real extraído e validado do Token JWT

  try {
    // 1. PARSE E VALIDAÇÃO DE PARÂMETROS: Garante que o ID da URL seja estritamente um número válido
    if (isNaN(idUsuario) || parseInt(idUsuario) <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "ID de usuário inválido.",
        dados: null
      });
    }

    // 2. CONTROLE DE PRIVACIDADE: Impede que o Usuário A altere o ID na URL para espionar o histórico do Usuário B.
    // O usuário só prossegue se o ID que ele está tentando acessar for estritamente igual ao ID do Token dele.
    if (parseInt(idUsuario) !== parseInt(idLogado)) {
      return res.status(403).json({ // 403: Forbidden
        sucesso: false,
        mensagem: "Acesso negado. Você só pode visualizar o seu próprio histórico.",
        dados: null
      });
    }

    // 3. BUSCA E ORDENAÇÃO: Traz os dados ordenados cronologicamente do mais recente para o mais antigo
    const historico = await pool.query(
      "SELECT * FROM doacoes WHERE usuario_id = $1 ORDER BY data_doacao DESC",
      [idLogado]
    );

    return res.json({
      sucesso: true,
      mensagem: "Histórico recuperado com sucesso.",
      dados: historico.rows
    });

  } catch (erro) {
    console.error("Erro ao buscar histórico:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro no servidor ao buscar histórico.",
      dados: null
    });
  }
};
