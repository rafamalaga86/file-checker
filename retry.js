const { consoleLogError, consoleLog } = require('./loggers');
const { finishCommandExecution } = require('./models/commandExecutions');
const { hasDirAccess } = require('./file-management');
const {
  deleteFailedByCommandId,
  getFailedByCommandId,
  calculateChecksumOfFileList,
} = require('./models/checksum');
const { exec } = require('./exec');

function receiveArguments() {
  const id = process.argv[2];

  if (!id) {
    consoleLogError('Error: Please provide a command execution ID.');
    process.exit(1);
  }
  return id;
}

async function run() {
  let commandExecutionId = receiveArguments();

  try {
    const failed = await getFailedByCommandId(commandExecutionId);

    if (failed.length === 0) {
      consoleLogError('There are no checksums with that ID');
      process.exit(1);
    }

    const fileList = failed.map(item => item.file_path);
    const directoryPath = failed[0].source;
    if (!hasDirAccess(directoryPath)) {
      consoleLogError('There are no access to dir: ' + directoryPath);
      process.exit(1);
    }
    await deleteFailedByCommandId(commandExecutionId);
    await calculateChecksumOfFileList(commandExecutionId, fileList, directoryPath);
  } catch (err) {
    // await finishCommandExecution(commandExecutionId, 'failure');
    console.log('Escupe: err', err);
    throw err;
  } finally {
    // Close the database connection
    // closeConnection();
  }
}

run();
