const { consoleLogError, consoleLog } = require('./loggers');
const {
  getFileList,
  getFileNameDuplicates,
  getFileNameFromPath,
} = require('./file-management');
const {
  startCommandExecution,
  finishCommandExecution,
} = require('./models/commandExecutions');
const { getDbConnection } = require('./db');
const { registerChecksum } = require('./models/checksum');
const { exec } = require('./exec');

function receiveArguments() {
  const directoryPath = process.argv[2];
  let commandExecutionId;

  // Validate directory path
  if (!directoryPath) {
    consoleLogError('Error: Please provide a directory path as an argument.');
    process.exit(1);
  }
  if (process.argv.includes('-p')) {
    const index = process.argv.indexOf('-p');
    commandExecutionId = process.argv[index + 1];
    consoleLog(`El valor de -p es: ${commandExecutionId}`);
  }
  return { directoryPath, commandExecutionId };
}

async function main() {
  let { directoryPath, commandExecutionId } = receiveArguments();
  const fileList = await getFileList(directoryPath);
  const duplicates = await getFileNameDuplicates(fileList);

  if (duplicates.length !== 0) {
    consoleLog('There are duplicates:');
    consoleLog(duplicates);
    process.exit(1);
  }

  let connection;

  try {
    connection = await getDbConnection();

    if (!commandExecutionId) {
      commandExecutionId = await startCommandExecution();
    }
    consoleLog(`Launched command process with ID: ${commandExecutionId}`);

    for (const filePath of fileList) {
      const fileName = getFileNameFromPath(filePath);
      let checksum;

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

      const id = await registerChecksum(
        directoryPath,
        filePath,
        checksum,
        commandExecutionId,
        stdoutString,
        stderrString
      );

      consoleLog(`Inserted checksum with ID: ${id}`);
    }
    await finishCommandExecution(commandExecutionId, 'success');
    consoleLog('File check completed successfully.');
  } catch (err) {
    await finishCommandExecution(commandExecutionId, 'failure');
    throw err;
  } finally {
    // Close the database connection
    if (connection) {
      connection.end();
    }
  }
}

main();
