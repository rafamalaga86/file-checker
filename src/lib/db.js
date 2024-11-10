const mysql = require('mysql2/promise');
const { config } = require('../config/config');

let connection;

async function getDbConnection() {
  if (!connection) {
    connection = await mysql.createConnection(config.dbConfig);
  }
  return connection;
}

function closeConnection() {
  if (connection) {
    connection.close();
  }
}

module.exports = { getDbConnection, closeConnection };
