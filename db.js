const mysql = require('mysql2/promise');
const { config } = require('./config');

let connection;

async function getDbConnection() {
  if (!connection) {
    connection = await mysql.createConnection(config.dbConfig);
  }
  return connection;
}

module.exports = { getDbConnection };
