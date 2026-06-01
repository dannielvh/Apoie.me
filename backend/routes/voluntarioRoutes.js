const express = require("express");
const router = express.Router();

const voluntarioController = require("../controllers/voluntarioController");
const autenticar = require("../middlewares/authMiddlewares");

// Usuário logado se candidata como voluntário
router.post("/", autenticar, voluntarioController.cadastrarVoluntario);

// Centro aprovado lista voluntários disponíveis
router.get("/", autenticar, voluntarioController.listarVoluntarios);

// Centro aprovado vê detalhes de um voluntário
router.get("/:id", autenticar, voluntarioController.buscarVoluntarioPorId);

// Centro aprovado seleciona um voluntário
router.post("/:id/selecionar", autenticar, voluntarioController.selecionarVoluntario,);

router.get("/selecionados/meu-centro", autenticar, voluntarioController.listarSelecionadosDoMeuCentro,);

router.patch("/selecionados/:id/status", autenticar, voluntarioController.atualizarStatusSelecionado,);

module.exports = router;
