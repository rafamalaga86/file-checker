const { consoleLogError, consoleLog } = require('./loggers');
const { getFileList, getFileNameDuplicates } = require('./file-management');
const {
  startCommandExecution,
  finishCommandExecution,
} = require('./models/commandExecutions');
const { calculateChecksumOfFileList } = require('./models/checksum');

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

async function run() {
  let { directoryPath, commandExecutionId } = receiveArguments();
  const fileList = await getFileList(directoryPath);
  const duplicates = await getFileNameDuplicates(fileList);

  if (duplicates.length !== 0) {
    consoleLog('There are duplicates:');
    consoleLog(duplicates);
    process.exit(1);
  }

  try {
    if (!commandExecutionId) {
      commandExecutionId = await startCommandExecution();
    }
    calculateChecksumOfFileList(commandExecutionId, fileList, directoryPath);
  } catch (err) {
    await finishCommandExecution(commandExecutionId, 'failure');
    throw err;
  } finally {
    // Close the database connection
    closeConnection();
  }
}

run();
