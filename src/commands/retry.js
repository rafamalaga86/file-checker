const { consoleLogError, consoleLog } = require('../lib/loggers');
const { finishCommandExecution, getDir, exists } = require('../models/commandExecutions');
const { hasDirAccess } = require('../lib/file-management');
const {
  deleteFailedByCommandId,
  getFailedByCommandId,
  calculateChecksumOfFileList,
} = require('../models/checksum');
const { shutDown } = require('../lib/shut-down');
const { receiveCommandExecutionId } = require('../lib/command-line');

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
    await deleteFailedByCommandId(commandExecutionId);
    await calculateChecksumOfFileList(commandExecutionId, fileList);
    await finishCommandExecution(commandExecutionId, 'success');
  } catch (err) {
    if (commandExecutionId) {
      await finishCommandExecution(commandExecutionId, 'failure');
    }
    throw err;
  }
  shutDown();
  process.exit(0);
}

run();
