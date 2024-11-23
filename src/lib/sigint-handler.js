const { status } = require('../enums/status');
const { finishCommandExecution } = require('../models/commandExecutions');
const { shutDown } = require('./shut-down');
const { consoleLog } = require('./loggers');

let commandExecutionId;

process.on('SIGINT', async () => {
  if (commandExecutionId) {
    await finishCommandExecution(commandExecutionId, status.INTERRUPTED);
  }
  shutDown();
  consoleLog('\n\nGracefully exited');
  process.exit(1);
});

function prepareSigint(id) {
  commandExecutionId = id;
}

module.exports = { prepareSigint };
