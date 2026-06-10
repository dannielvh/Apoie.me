const express = require('express');
const router = express.Router();

const voluntarioController = require('../controllers/voluntarioController');
const autenticar = require('../middlewares/authMiddlewares');

// CADASTRAR PERFIL

router.post(
  '/voluntarios',
  autenticar,
  voluntarioController.cadastrarVoluntario
);

// BUSCAR MEU PERFIL

router.get(
  '/voluntarios/me',
  autenticar,
  voluntarioController.buscarMeuPerfil
);





module.exports = router;