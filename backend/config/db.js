const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'emergencia',
  password: '0403',
  port: 5432,
});

module.exports = pool;