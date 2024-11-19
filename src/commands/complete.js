const { consoleLogError, consoleLog, printArray } = require('../lib/loggers');
const {
  getFileList,
  getFileNameDuplicates,
  hasDirAccess,
} = require('../lib/file-management');
const {
  finishCommandExecution,
  getDir,
  exists,
  markStatus,
} = require('../models/commandExecutions');
const {
  calculateChecksumOfFileList,
  getFilePathByCommandId,
  countFailedByCommandId,
} = require('../models/checksum');
const { shutDown } = require('../lib/shut-down');
const {
  confirmOrAbort,
  receiveCommandExecutionId,
  ynQuestion,
} = require('../lib/command-line');
const { statusView } = require('../views/complete');

async function run() {
  const commandExecutionId = receiveCommandExecutionId();
  const commandExists = await exists(commandExecutionId);

  if (!commandExists) {
    consoleLogError('That command execution id does not exists');
    process.exit(1);
  }

  const dir = await getDir(commandExecutionId);
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
    const dbFiles = await getFilePathByCommandId(commandExecutionId);
    const fileListArray = Array.from(fileList);
    const filesToComplete = fileListArray.filter(item => !dbFiles.includes(item));
    const extraFiles = dbFiles.filter(item => !fileListArray.includes(item));

    statusView(
      fileListArray.length,
      dir,
      dbFiles.length,
      filesToComplete.length,
      extraFiles.length
    );

    if (extraFiles.length) {
      const seeThem = await ynQuestion('Want to see the files?');
      if (seeThem) {
        printArray(extraFiles);
      }
    }

    // If all completed and no failed checksum, mark as success
    const failedNumber = await countFailedByCommandId(commandExecutionId);
    if (filesToComplete.length === 0 && failedNumber === 0) {
      await markStatus(commandExecutionId, 'success');
    }

    if (filesToComplete.length > 0) {
      await confirmOrAbort();
      await calculateChecksumOfFileList(commandExecutionId, filesToComplete);
      await finishCommandExecution(commandExecutionId, 'success');
    }
  } catch (err) {
    if (commandExecutionId) {
      await finishCommandExecution(commandExecutionId, 'failure');
    }
    shutDown();
    throw err;
  }
  shutDown();
  process.exit(0);
}

run();
