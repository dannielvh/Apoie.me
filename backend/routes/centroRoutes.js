const express = require('express');
const router = express.Router();

const centroController = require('../controllers/centroController');
const autenticar = require('../middlewares/authMiddlewares');


// ======================================
// TESTE DA ROTA MEU CENTRO
// ======================================
router.get(
  '/centros/meu-centro',
  autenticar,
  centroController.buscarCentroUsuario
);


// ======================================
// ATUALIZAR CENTRO DO USUÁRIO
// ======================================
router.put(
  '/centros/meu-centro',
  autenticar,
  centroController.atualizarMeuCentro
);


// ======================================
// CRIAR CENTRO
// ======================================
router.post(
  '/centros',
  autenticar,
  centroController.criarCentro
);


// ======================================
// LISTAR CENTROS
// ======================================
router.get(
  '/centros',
  centroController.listarCentros
);


// ======================================
// ATUALIZAR CENTRO
// ======================================
router.put(
  '/centros/:id',
  autenticar,
  centroController.atualizarCentro
);


// ======================================
// DELETAR CENTRO
// ======================================
router.delete(
  '/centros/:id',
  autenticar,
  centroController.deletarCentro
);


// ======================================
// APROVAR CENTRO
// ======================================
router.patch(
  '/centros/:id/aprovar',
  autenticar,
  centroController.aprovarCentro
);


module.exports = router;