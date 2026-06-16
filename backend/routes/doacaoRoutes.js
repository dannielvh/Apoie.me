const express = require("express");
const router = express.Router();

const doacaoController = require("../controllers/doacaoController");
const autenticar = require("../middlewares/authMiddlewares");

// Público: usuário comum vê pedidos ativos
router.get("/necessidades", doacaoController.listarNecessidades);

// Centro logado: gerencia seus pedidos
router.get("/pedidos-doacao/meu-centro", autenticar, doacaoController.listarPedidosMeuCentro);
router.post("/pedidos-doacao", autenticar, doacaoController.criarDoacao);
router.put("/pedidos-doacao/:id", autenticar, doacaoController.editarDoacao);
router.patch("/pedidos-doacao/:id/recebimento", autenticar, doacaoController.atualizarRecebimento);
router.delete("/pedidos-doacao/:id", autenticar, doacaoController.excluirDoacao);

module.exports = router;