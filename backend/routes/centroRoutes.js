const express = require('express');
const router = express.Router();

const centroController = require('../controllers/centroController');
const autenticar = require('../middlewares/authMiddlewares');


router.get('/centros/meu-centro', autenticar, centroController.buscarCentroUsuario);
router.put('/centros/meu-centro', autenticar, centroController.atualizarMeuCentro);


router.post('/centros', autenticar,centroController.criarCentro);
router.get('/centros', centroController.listarCentros);
router.put('/centros/:id', autenticar,centroController.atualizarCentro);
router.delete('/centros/:id', autenticar,centroController.deletarCentro);

router.patch('/:id/aprovar', autenticar,centroController.aprovarCentro);

module.exports = router;