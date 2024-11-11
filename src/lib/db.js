const mysql = require('mysql2/promise');
const { config } = require('../config/config');
const { consoleLogError } = require('./loggers');

let connection;

async function getDbConnection() {
  try {
    if (!connection) {
      connection = await mysql.createConnection(config.dbConfig);
    }
  } catch (err) {
    consoleLogError('Could not create a connection to the database');
    process.exit(1);
  }
  return connection;
}

function closeConnection() {
  if (connection) {
    connection.close();
  }
}

module.exports = { getDbConnection, closeConnection };
