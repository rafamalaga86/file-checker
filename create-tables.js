const mysql = require('mysql2/promise');

async function main() {
  // Database connection configuration
  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'file-checker',
    port: 6666,
  };

  let connection;
  try {
    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    // Create command executions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS command_executions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at DATETIME NOT NULL,
        stdout TEXT,
        stderr TEXT,
        status VARCHAR(255) NOT NULL
      )
    `);
    console.log('Command executions table created successfully.');

    // Create checksum table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS checksum (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hd VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        checksum VARCHAR(255) NOT NULL,
        command_execution_id INT,
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
