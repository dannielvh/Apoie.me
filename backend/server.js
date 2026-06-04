const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const usuarioRoutes = require('./routes/usuarioRoutes');
app.use('/api', usuarioRoutes);

const centroRoutes = require('./routes/centroRoutes');
app.use('/api', centroRoutes);

const voluntarioRoutes = require('./routes/voluntarioRoutes');
app.use('/api/voluntarios', voluntarioRoutes);

const candidaturaRoutes = require('./routes/candidaturaRoutes');
app.use('/api', candidaturaRoutes);

const voluntarioRoutes = require('./routes/voluntarioRoutes');
app.use('/api', voluntarioRoutes);

app.listen(3000, () => {
     console.log('Servidor iniciado na porta 3000');
});