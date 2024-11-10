const { consoleLogError, consoleLog } = require('../lib/loggers');
const { getFileList, getFileNameDuplicates } = require('../lib/file-management');
const { finishCommandExecution, getDir } = require('../models/commandExecutions');
const {
  calculateChecksumOfFileList,
  getFilePathByCommandId,
} = require('../models/checksum');

function receiveArguments() {
  const commandExecutionId = Number(process.argv[2]);

  if (isNaN(commandExecutionId) || commandExecutionId < 1) {
    consoleLogError('You should pass a parameter of a valid command execution id');
    process.exit(1);
  }
  return commandExecutionId;
}

async function run() {
  const commandExecutionId = receiveArguments();
  const dir = await getDir(commandExecutionId);
  const fileList = await getFileList(dir);
  const duplicates = await getFileNameDuplicates(fileList);

  if (duplicates.length !== 0) {
    consoleLog('There are duplicates:');
    consoleLog(duplicates);
    process.exit(1);
  }

  try {
    const dbFiles = await getFilePathByCommandId(commandExecutionId);
    const fileListArray = Array.from(fileList);
    const filesToComplete = fileListArray.filter(item => !dbFiles.includes(item));

    consoleLog(`Found ${fileListArray.length} files in ${dir}`);
    consoleLog(`Found ${dbFiles.length} files in the database`);
    consoleLog(`There are ${filesToComplete.length} files to complete`);
    await calculateChecksumOfFileList(commandExecutionId, filesToComplete, dir);
  } catch (err) {
    await finishCommandExecution(commandExecutionId, 'failure');
    throw err;
  } finally {
    // Close the database connection
    // closeConnection();
  }
}

run();
