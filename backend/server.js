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

// Importação das rotas existentes
const usuarioRoutes = require('./routes/usuarioRoutes');
app.use('/api', usuarioRoutes);

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

// ATENÇÃO: Importando e ativando as rotas de doação que você acabou de criar!
const doacaoRoutes = require('./routes/doacaoRoutes');
app.use('/api', doacaoRoutes);

// =========================================================================
// TRATAMENTO GLOBAL DE ERROS (Último item do checklist)
// =========================================================================
// ATENÇÃO: Deve ser sempre o ÚLTIMO middleware antes do app.listen!
app.use((err, req, res, next) => {
  // Log detalhado no terminal para ajudar o grupo no desenvolvimento
  console.error("====== ERRO GLOBAL CAPTURADO ======");
  console.error(`Mensagem: ${err.message}`);
  console.error(err.stack);
  console.error("===================================");

  const statusCode = err.status || 500;

  // Retorno estritamente padronizado no formato { sucesso, mensagem, dados }
  return res.status(statusCode).json({
    sucesso: false,
    mensagem: "Ocorreu um erro interno inesperado no servidor. Tente novamente mais tarde.",
    dados: null
  });
});

app.listen(3000, () => {
     console.log('Servidor iniciado na porta 3000');
});