const { consoleLogError, consoleLog } = require('../lib/loggers');
const {
  finishCommandExecution,
  getDir,
  exists,
  markStatus,
} = require('../models/commandExecutions');
const { hasDirAccess } = require('../lib/file-management');
const {
  deleteFailedByCommandId,
  getFailedByCommandId,
  calculateChecksumOfFileList,
} = require('../models/checksum');
const { shutDown } = require('../lib/shut-down');
const { receiveCommandExecutionId, confirmOrAbort } = require('../lib/command-line');
const { ProgressBar } = require('../lib/bar');
const { status } = require('../enums/status');

async function run() {
  let commandExecutionId = receiveCommandExecutionId();
  const commandExists = await exists(commandExecutionId);
  if (!commandExists) {
    consoleLogError('That command execution id does not exists');
    process.exit(1);
  }

  try {
    const failed = await getFailedByCommandId(commandExecutionId);

    if (failed.length === 0) {
      consoleLogError('There are no failed checksums with that command ID');
      process.exit(1);
    }

    consoleLog(`There will be ${failed.length} retries.`);

    const fileList = failed.map(item => item.file_path);
    const dir = await getDir(commandExecutionId);
    if (!hasDirAccess(dir)) {
      consoleLogError('There are no access to dir: ' + dir);
      process.exit(1);
    }

    await confirmOrAbort();
    await markStatus(commandExecutionId, status.RUNNING);
    await deleteFailedByCommandId(commandExecutionId);
    const bar = new ProgressBar(fileList.length, dir, commandExecutionId);
    await calculateChecksumOfFileList(commandExecutionId, fileList, bar);
    await finishCommandExecution(commandExecutionId, status.SUCCESS);
  } catch (err) {
    if (commandExecutionId) {
      await finishCommandExecution(commandExecutionId, status.FAILURE);
    }
    throw err;
  }
  shutDown();
  process.exit(0);
}

run();
