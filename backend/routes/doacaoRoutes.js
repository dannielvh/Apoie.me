const express = require('express');
const router = express.Router();

const doacaoController = require('../controllers/doacaoController');
const autenticar = require('../middlewares/authMiddlewares');

// Listar necessidades dos centros
router.get('/necessidades', doacaoController.listarNecessidades);

// Registrar uma doação
router.post('/doacao', autenticar, doacaoController.criarDoacao);

// Histórico de doações do usuário
router.get('/historico/:idUsuario', autenticar, doacaoController.obterHistorico);

module.exports = router;