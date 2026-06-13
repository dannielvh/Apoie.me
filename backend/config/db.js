//conexão com PostgreSQL
const { Pool } = require('pg');

//cria conexão com banco de dados emergencia
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'apoieme',
  password: '0403',
  port: 5432,
});

module.exports = pool;