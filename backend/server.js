/**
 * ============================================================================
 * APOIE.ME - SERVIDOR PRINCIPAL (BACKEND)
 * ============================================================================
 * Arquivo de inicialização da API RESTful, responsável pela configuração do
 * Express, middlewares globais e roteamento modular da aplicação.
 */

const express = require("express");
const cors = require("cors");

const app = express();

// ==========================================
// MIDDLEWARES GLOBAIS
// ==========================================

// Permite requisições entre frontend e backend
app.use(cors());

// Permite receber JSON no corpo das requisições
app.use(express.json());

// ==========================================
// IMPORTAÇÃO DAS ROTAS
// ==========================================

const usuarioRoutes = require("./routes/usuarioRoutes");
const centroRoutes = require("./routes/centroRoutes");
const voluntarioRoutes = require("./routes/voluntarioRoutes");
const candidaturaRoutes = require("./routes/candidaturaRoutes");
const doacaoRoutes = require("./routes/doacaoRoutes");

// ==========================================
// USO DAS ROTAS
// ==========================================

// Todas as rotas começam com /api
app.use("/api", usuarioRoutes);
app.use("/api", centroRoutes);
app.use("/api", voluntarioRoutes);
app.use("/api", candidaturaRoutes);
app.use("/api", doacaoRoutes);

// ==========================================
// ROTA DE TESTE
// ==========================================

app.get("/", (req, res) => {
  res.send("API Apoie.me rodando");
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});