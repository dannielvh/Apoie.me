const express = require('express');
const router = express.Router();

const centroController = require('../controllers/centroController');

router.get('/centros', centroController.listarCentros);
router.post('/centros', centroController.criarCentro);
router.put('/centros/:id', centroController.atualizarCentro);
router.delete('/centros/:id', centroController.deletarCentro);

router.patch('/:id/aprovar', centroController.aprovarCentro);

module.exports = router;