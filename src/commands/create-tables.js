const mysql = require('mysql2/promise');
const readline = require('readline');
const { config } = require('../config/config');
const { closeConnection, getDbConnection } = require('../lib/db');
const { consoleLogError, consoleLog } = require('../lib/loggers');

async function run() {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  await readlineInterface.question(
    'This will drop existing tables and create them again. Are you sure? (y/n): ',
    response => {
      if (response.toLowerCase() === 'y') {
        createTables();
      }
      readlineInterface.close();
    }
  );
}

async function createTables() {
  const dbConfig = config.dbConfig;
  let connection;
  try {
    // Connect to the database
    const connection = await getDbConnection();

    await connection.execute(`DROP TABLE IF EXISTS checksums`);
    await connection.execute(`DROP TABLE IF EXISTS command_executions`);

    // Create command executions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS command_executions (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        dir VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL,
        ended_at DATETIME
      );
    `);
    consoleLog('Command executions table created successfully.');

    // Create checksum table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS checksums (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        command_execution_id BIGINT UNSIGNED,
        file_path VARCHAR(255) NOT NULL,
        file VARCHAR(255) NOT NULL,
        checksum VARCHAR(255) NOT NULL,
        stdout TEXT,
        stderr TEXT,
        FOREIGN KEY (command_execution_id) REFERENCES command_executions(id)
      );
    `);
    consoleLog('Checksum table created successfully.');
  } catch (err) {
    consoleLogError('Error creating tables:');
    consoleLog(err);
  } finally {
    closeConnection();
    process.exit(1);
  }
}

run();
