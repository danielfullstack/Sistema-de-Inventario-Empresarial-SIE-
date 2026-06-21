const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sie_db',
  password: 'daniel',
  port: 5432
});

module.exports = pool;
