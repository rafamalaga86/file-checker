const { consoleLogError, consoleLog } = require('../lib/loggers');
const { getFileList, getFileNameDuplicates } = require('../lib/file-management');
const {
  startCommandExecution,
  finishCommandExecution,
} = require('../models/commandExecutions');
const { calculateChecksumOfFileList } = require('../models/checksum');

function receiveArguments() {
  const dir = process.argv[2];
  let commandExecutionId;

  // Validate directory path
  if (!dir) {
    consoleLogError('Error: Please provide a directory path as an argument.');
    process.exit(1);
  }
  if (process.argv.includes('-p')) {
    const index = process.argv.indexOf('-p');
    commandExecutionId = process.argv[index + 1];
    consoleLog(`El valor de -p es: ${commandExecutionId}`);
  }
  return { dir, commandExecutionId };
}

async function run() {
  let { dir, commandExecutionId } = receiveArguments();
  const fileList = await getFileList(dir);
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
    calculateChecksumOfFileList(commandExecutionId, fileList, dir);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      consoleLogError('Could not make a successful connection to the database.');
      process.exit(1);
    }
    await finishCommandExecution(commandExecutionId, 'failure');
    throw err;
  } finally {
    // Close the database connection
    // closeConnection();
  }
}

run();
