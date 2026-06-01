const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const usuarioRoutes = require('./routes/usuarioRoutes');
app.use('/api', usuarioRoutes);

const centroRoutes = require('./routes/centroRoutes');
app.use('/api', centroRoutes);

const doacaoRoutes = require('./routes/doacaoRoutes');
app.use('/api', doacaoRoutes);

app.listen(3000, () => {
     console.log('Servidor iniciado na porta 3000');
});