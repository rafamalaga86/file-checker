const { closeConnection, getDbConnection } = require('../lib/db');
const {
  consoleLogError,
  consoleLog,
  print,
  printYellow,
  eol,
} = require('../lib/loggers');
const { ynQuestion } = require('../lib/command-line');
const { config } = require('../config/config');

async function run() {
  print('This will drop all tables in the database ');
  printYellow(config.dbConfig.database);
  print(' and create them again');
  eol();
  const response = await ynQuestion('Are you sure?');

  if (response) {
    createTables();
  }
}

async function createTables() {
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
        CONSTRAINT uc_command_execution_filepath UNIQUE (command_execution_id, file_path),
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
