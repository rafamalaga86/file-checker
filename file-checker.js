const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const config = require('./config');

const ignoredFilesAndDirs = config.ignoredFilesAndDirs;
const dbConfig = config.dbConfig;
const fileNames = new Set();
const fileList = new Set();

function receiveArguments() {
  // Get directory path from command line arguments
  const directoryPath = process.argv[2];

  // Validate directory path
  if (!directoryPath) {
    console.error('Error: Please provide a directory path as an argument.');
    process.exit(1);
  }

  return directoryPath;
}

async function getFileList(currentDir) {
  const files = fs.readdirSync(currentDir);
  // console.log('Escupe: ', files);
  // process.exit(0);

  for (const file of files) {
    const filePath = path.join(currentDir, file);

    if (ignoredFilesAndDirs.includes(file)) {
      continue;
    }

    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      // Recursively process subdirectories
      await getFileList(filePath);
      continue;
    }

    // Check for duplicate fileNames
    if (fileNames.has(file)) {
      throw new Error(`Duplicate filename found: ${file}`);
    }
    fileNames.add(file);
    fileList.add(filePath);
  }
}

async function main() {
  const directoryPath = receiveArguments();
  await getFileList(directoryPath);

  let connection, commandStartTime, commandExecutionId;

  try {
    connection = await mysql.createConnection(dbConfig);
    commandStartTime = new Date();

    // Insert command execution data into the database FIRST
    const [result] = await connection.execute(
      'INSERT INTO command_executions (created_at, stdout, stderr, status) VALUES (?, ?, ?, ?)',
      [commandStartTime, '', '', 'running']
    );
    commandExecutionId = result.insertId; // Assign commandExecutionId here

    // Function to recursively traverse the directory and process files
    async function processDirectory(currentDir) {
      for (const filePath of fileList) {
        try {
          // Calculate checksum
          const fileContent = fs.readFileSync(filePath);
          const checksum = crypto.createHash('sha256').update(fileContent).digest('hex');

          // Insert checksum data into the database
          const [result] = await connection.execute(
            'INSERT INTO checksum (hd, filename, checksum, command_execution_id) VALUES (?, ?, ?, ?)',
            [directoryPath, filePath, checksum, commandExecutionId]
          );
          const parts = filePath.split('/');
          const file = parts[parts.length - 1];
          console.log(`Checksum for ${file} inserted with ID: ${result.insertId}`);
        } catch (err) {
          console.error(`Error calculating checksum for ${filePath}:`, err);
        }
      }
    }

    // Process the provided directory
    await processDirectory(directoryPath);

    // Update command execution status to 'success'
    const commandEndTime = new Date();
    await connection.execute(
      'UPDATE command_executions SET status = ?, ended_at = ? WHERE id = ?',
      ['success', commandEndTime, commandExecutionId]
    );

    console.log('File check completed successfully.');
  } catch (err) {
    console.error('Error:', err);

    // Store command execution data with error information
    const commandEndTime = new Date();
    const commandExecutionStatus = 'failure';
    await connection.execute(
      'INSERT INTO command_executions (created_at, stdout, stderr, status, ended_at) VALUES (?, ?, ?, ?, ?)',
      [commandStartTime, '', err.message, commandExecutionStatus, commandEndTime]
    );

    process.exit(1);
  } finally {
    // Close the database connection
    if (connection) {
      connection.end();
    }
  }
}

main();
