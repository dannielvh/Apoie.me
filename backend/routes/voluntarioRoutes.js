const express = require('express');
const router = express.Router();

const voluntarioController = require('../controllers/voluntarioController');
const autenticar = require('../middlewares/authMiddlewares');

<<<<<<< Updated upstream

// CADASTRAR PERFIL
=======
>>>>>>> Stashed changes
router.post(
  '/voluntarios',
  autenticar,
  voluntarioController.cadastrarVoluntario
);

<<<<<<< Updated upstream

// BUSCAR MEU PERFIL
=======
>>>>>>> Stashed changes
router.get(
  '/voluntarios/me',
  autenticar,
  voluntarioController.buscarMeuPerfil
);

module.exports = router;