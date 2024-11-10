const { consoleLogError, consoleLog } = require('../lib/loggers');
const { getFileList, getFileNameDuplicates } = require('../lib/file-management');
const {
  startCommandExecution,
  finishCommandExecution,
} = require('../models/commandExecutions');
const { calculateChecksumOfFileList } = require('../models/checksum');

function receiveArguments() {
  const dir = process.argv[2];

  // Validate directory path
  if (!dir) {
    consoleLogError('Error: Please provide a directory path as an argument.');
    process.exit(1);
  }
  return dir;
}

async function run() {
  let dir = receiveArguments();
  const fileList = await getFileList(dir);
  const duplicates = await getFileNameDuplicates(fileList);

  if (duplicates.length !== 0) {
    consoleLog('There are duplicates:');
    consoleLog(duplicates);
    process.exit(1);
  }

  try {
    const commandExecutionId = await startCommandExecution(dir);
    calculateChecksumOfFileList(commandExecutionId, fileList, dir);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      consoleLogError('Could not make a successful connection to the database.');
      process.exit(1);
    }
    if (commandExecutionId) {
      await finishCommandExecution(commandExecutionId, 'failure');
    }
    throw err;
  } finally {
    // Close the database connection
    // closeConnection();
  }
}

run();
