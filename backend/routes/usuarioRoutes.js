// Importa o framework Express
const express = require('express');

// Cria um "mini app" de rotas (Router)
// Serve pra organizar as rotas separadas do app principal
const router = express.Router();

// Importa o controller de usuário
// Esse arquivo tem as funções cadastrarUsuario e loginUsuario
const usuarioController = require('../controllers/usuarioController');


// ROTA DE CADASTRO
// Quando alguém fizer uma requisição POST para /cadastro
// o Express vai chamar a função cadastrarUsuario do controller
router.post('/cadastro', usuarioController.cadastrarUsuario);


// ROTA DE LOGIN
// Quando alguém fizer POST para /login
// chama a função loginUsuario do controller
router.post('/login', usuarioController.loginUsuario);


// Exporta esse conjunto de rotas
// Isso permite usar esse arquivo em outro lugar (ex: app.js ou server.js)
module.exports = router;