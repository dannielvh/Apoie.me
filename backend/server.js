const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const usuarioRoutes = require('./routes/usuarioRoutes');
const centroRoutes = require('./routes/centroRoutes');
const voluntarioRoutes = require('./routes/voluntarioRoutes');
const candidaturaRoutes = require('./routes/candidaturaRoutes');

app.use('/api', usuarioRoutes);
app.use('/api', centroRoutes);
app.use('/api', voluntarioRoutes);
app.use('/api', candidaturaRoutes);

app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
});