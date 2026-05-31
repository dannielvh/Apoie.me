const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ======================
// ROTAS
// ======================
const usuarioRoutes = require('./routes/usuarioRoutes');
console.log("usuarioRoutes carregado");

const centroRoutes = require('./routes/centroRoutes');
console.log("centroRoutes carregado");

app.use('/api', usuarioRoutes);
app.use('/api', centroRoutes);

app.listen(3000, () => {
     console.log('Servidor iniciado na porta 3000');
});