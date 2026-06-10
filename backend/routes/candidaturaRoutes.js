const express = require('express');
const router = express.Router();

const candidaturaController = require('../controllers/candidaturaController');
const autenticar = require('../middlewares/authMiddlewares');


router.post("/candidaturas", autenticar, candidaturaController.criarCandidatura);
router.get("/candidaturas", autenticar, candidaturaController.listarCandidaturas);
router.patch("/candidaturas/:id/status", autenticar, candidaturaController.atualizarStatus);

module.exports = router;