// db.js
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'eisd_10',     
  user: 'postgres',             
  password: 'postgres'         
});

// Export biar bisa dipakai di file lain
module.exports = client;