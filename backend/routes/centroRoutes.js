const express = require('express');
const router = express.Router();

const centroController = require('../controllers/centroController');

router.get('/centros', centroController.listarCentros);

module.exports = router;