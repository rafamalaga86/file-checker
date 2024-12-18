const { consoleLogError, consoleLog } = require('../lib/loggers');
const {
  getFileList,
  getFileNameDuplicates,
  hasDirAccess,
} = require('../lib/file-management');
const {
  startCommandExecution,
  finishCommandExecution,
} = require('../models/commandExecutions');
const { calculateChecksumOfFileList } = require('../models/checksum');
const { shutDown } = require('../lib/shut-down');
const { ProgressBar } = require('../lib/bar');
const { status } = require('../enums/status');
const { prepareSigint } = require('../lib/sigint-handler');

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

  if (!hasDirAccess(dir)) {
    consoleLogError('There are no access to dir: ' + dir);
    process.exit(1);
  }

  const fileList = await getFileList(dir);
  const duplicates = await getFileNameDuplicates(fileList);

  if (duplicates.length !== 0) {
    consoleLog('There are duplicates:');
    consoleLog(duplicates);
    process.exit(1);
  }

  try {
    const commandExecutionId = await startCommandExecution(dir);
    prepareSigint(commandExecutionId);

    const bar = new ProgressBar(fileList.length, dir, commandExecutionId);
    const statusResult = await calculateChecksumOfFileList(
      commandExecutionId,
      fileList,
      bar
    );
    await finishCommandExecution(commandExecutionId, statusResult);
  } catch (err) {
    if (typeof commandExecutionId !== 'undefined') {
      await finishCommandExecution(commandExecutionId, status.FAILURE);
    }
    shutDown();
    throw err;
  }
  shutDown();
  process.exit(0);
}

run();
