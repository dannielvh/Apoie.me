const pool = require('./config/db');

async function testarConexao() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conectado com sucesso!');
    console.log(res.rows);
  } catch (erro) {
    console.error('Erro na conexão:', erro.message);
  }
}

testarConexao();