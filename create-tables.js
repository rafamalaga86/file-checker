const mysql = require('mysql2/promise');
const readline = require('readline');
const config = require('./config');

async function main() {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  await readlineInterface.question(
    'This will drop existing tables and create them again. Are you sure? (y/n): ',
    response => {
      if (response.toLowerCase() === 'y') {
        run();
      }
      readlineInterface.close();
    }
  );
}

async function run() {
  const dbConfig = config.dbConfig;
  let connection;
  try {
    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    await connection.execute(`DROP TABLE IF EXISTS checksum`);
    await connection.execute(`DROP TABLE IF EXISTS command_executions`);

    // Create command executions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS command_executions (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        stdout TEXT,
        stderr TEXT,
        status VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL,
        ended_at DATETIME
      )
    `);
    console.log('Command executions table created successfully.');

    // Create checksum table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS checksum (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        command_execution_id BIGINT UNSIGNED,
        hd VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        checksum VARCHAR(255) NOT NULL,
        FOREIGN KEY (command_execution_id) REFERENCES command_executions(id)
      )
    `);
    console.log('Checksum table created successfully.');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    // Close the database connection
    if (connection) {
      connection.end();
    }
  }
}

main();
