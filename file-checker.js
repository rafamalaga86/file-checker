const fs = require('fs');
const path = require('path');
// const crypto = require('crypto');
const mysql = require('mysql2/promise');
const { config } = require('./config');
const { spawnSync } = require('node:child_process');

const execSync = require('child_process').execSync;
code = execSync('node -v');

const ignoredFilesAndDirs = config.ignoredFilesAndDirs;
const dbConfig = config.dbConfig;
const fileList = new Set();
const fileNames = new Set();

function consoleLogError(message) {
  const red = '\x1b[31m';
  const reset = '\x1b[0m';
  console.error(red + message + reset);
}
function consoleLog(message) {
  console.log(message);
}

function receiveArguments() {
  // Get directory path from command line arguments
  const directoryPath = process.argv[2];

  // Validate directory path
  if (!directoryPath) {
    consoleLogError('Error: Please provide a directory path as an argument.');
    process.exit(1);
  }

  return directoryPath;
}

function exec(cmd, args) {
  const processResult = spawnSync(cmd, args, {
    encoding: 'utf8',
    shell: true,
  });
  return processResult;
}

async function getFileList(currentDir) {
  const files = fs.readdirSync(currentDir);

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
    consoleLog(`Launched checksum process with ID: ${commandExecutionId}`);

    for (const filePath of fileList) {
      const filePathArray = filePath.split('/');
      const fileName = filePathArray[filePathArray.length - 1];
      let checksum;

      try {
        // const commandResult = exec('ls /un/directorio/que/no/existe');
        const commandResult = await exec(`sha256sum "${filePath}"`);

        const stdoutString = commandResult.stdout.toString();
        const stderrString = commandResult.stderr.toString();
        const stdout = stdoutString.split('  ');
        checksum = stdout[0];

        if (stderrString) {
          consoleLogError(`Error calculating checksum for ${filePath}:`, stderrString);
        }
        if (checksum) {
          consoleLog(`${fileName} -> ${checksum}`);
        }
      } catch (err) {
        // consoleLogError(`Error calculating checksum for ${filePath}:`, err);
        consoleLogError(err);
        continue;
      }

      // Insert checksum data into the database
      const [result] = await connection.execute(
        'INSERT INTO checksum (hd, filename, checksum, command_execution_id) VALUES (?, ?, ?, ?)',
        [directoryPath, filePath, checksum, commandExecutionId]
      );
      consoleLog(`Inserted with ID: ${result.insertId}`);
    }
    // Update command execution status to 'success'
    const commandEndTime = new Date();
    await connection.execute(
      'UPDATE command_executions SET status = ?, ended_at = ? WHERE id = ?',
      ['success', commandEndTime, commandExecutionId]
    );

    consoleLog('File check completed successfully.');
  } catch (err) {
    // Store command execution data with error information
    const commandEndTime = new Date();
    const commandExecutionStatus = 'failure';
    await connection.execute(
      'INSERT INTO command_executions (created_at, stdout, stderr, status, ended_at) VALUES (?, ?, ?, ?, ?)',
      [commandStartTime, '', err.message, commandExecutionStatus, commandEndTime]
    );
    throw err;
  } finally {
    // Close the database connection
    if (connection) {
      connection.end();
    }
  }
}

main();
