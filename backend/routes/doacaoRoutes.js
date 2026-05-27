const express = require('express');
const router = express.Router();

// Centralização da lógica de negócio nos controllers para manter a arquitetura limpa
const doacaoController = require('../controllers/doacaoController'); 

// Middleware unificado de autenticação (substitui as validações manuais de token nas rotas)
const autenticar = require('../middlewares/authMiddleware'); 

/**
 * ROTA: Registro de nova doação
 * Método antigo do grupo migrado para o Controller com injeção do middleware de segurança.
 */
router.post('/doacao', autenticar, doacaoController.criarDoacao);

/**
 * ROTA: Histórico de doações por ID de usuário
 * Nova funcionalidade adicionada atendendo os requisitos de integridade e privacidade de dados.
 */
router.get('/historico/:idUsuario', autenticar, doacaoController.obterHistorico);

module.exports = router;