const { deleteByCommandId } = require('../models/checksum');
const { consoleLog } = require('../lib/loggers');
const { receiveCommandExecutionId } = require('../lib/command-line');
const { exists } = require('../models/commandExecutions');

async function run() {
  let commandExecutionId = receiveCommandExecutionId();
  const commandExists = await exists(commandExecutionId);
  if (!commandExists) {
    consoleLogError('That command execution id does not exists');
    process.exit(1);
  }
  const { queryResult1, queryResult2 } = await deleteByCommandId(commandExecutionId);
  consoleLog(`Rows of checksum deleted: ${queryResult1.affectedRows}`);
  consoleLog(`Rows of command execution deleted: ${queryResult2.affectedRows}`);

  process.exit(0);
}

run();
