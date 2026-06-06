const express = require('express');
const router = express.Router();
const voluntarioController = require('../controllers/voluntarioController');

// Rota para carregar cidades
router.get('/cidades', voluntarioController.listarCidades);

// Rota para carregar centros dinamicamente por cidade
router.get('/centros/:id_cidade', voluntarioController.listarCentrosPorCidade);

// Rota para enviar o formulário de candidatura
router.post('/candidatar', voluntarioController.criarCandidatura);

// Rota para listar as candidaturas já feitas
router.get('/candidaturas', voluntarioController.listarCandidaturas);

module.exports = router;