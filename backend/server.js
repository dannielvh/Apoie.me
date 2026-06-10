/**
 * ============================================================================
 * APOIE.ME - SERVIDOR PRINCIPAL (BACKEND)
 * ============================================================================
 */

const express = require("express");
const cors = require("cors");

const app = express();

// ==========================================
// MIDDLEWARES GLOBAIS
// ==========================================

app.use(cors());
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
// TRATAMENTO GLOBAL DE ERROS
// ==========================================

app.use((err, req, res, next) => {
  console.error("====== ERRO GLOBAL CAPTURADO ======");
  console.error(`Mensagem: ${err.message}`);
  console.error(err.stack);
  console.error("===================================");

  const statusCode = err.status || 500;

  return res.status(statusCode).json({
    sucesso: false,
    mensagem:
      "Ocorreu um erro interno inesperado no servidor. Tente novamente mais tarde.",
    dados: null,
  });
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});