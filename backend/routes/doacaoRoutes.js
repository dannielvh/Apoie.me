const express = require('express');
const router = express.Router();
const doacaoController = require('../controllers/doacaoController');

router.get('/necessidades', doacaoController.listarNecessidades);
router.post('/doacoes', doacaoController.criarDoacao);

module.exports = router;
