const express = require('express');
const router = express.Router();

const candidaturaController = require('../controllers/candidaturaController');
const autenticar = require('../middlewares/authMiddlewares');


// CADASTRAR CANDIDATURA
router.post(
  '/candidaturas',
  autenticar,
  candidaturaController.criarCandidatura
);


// LISTAR CANDIDATURAS
router.get(
  '/candidaturas',
  autenticar,
  candidaturaController.listarCandidaturas
);


// ATUALIZAR STATUS
router.patch(
  '/candidaturas/:id/status',
  autenticar,
  candidaturaController.atualizarStatus
);

module.exports = router;