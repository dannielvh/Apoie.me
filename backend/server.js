const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Importação das rotas existentes
const usuarioRoutes = require('./routes/usuarioRoutes');
app.use('/api', usuarioRoutes);

const centroRoutes = require('./routes/centroRoutes');
app.use('/api', centroRoutes);

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