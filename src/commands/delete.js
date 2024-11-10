const { deleteByCommandId } = require('../models/checksum');
const { consoleLog } = require('../lib/loggers');

function receiveArguments() {
  const id = process.argv[2];
  if (!id) {
    consoleLog('You need to pass an argument of the command execution id.');
    process.exit(1);
  }
  return id;
}

async function main() {
  const id = receiveArguments();
  const { queryResult1, queryResult2 } = await deleteByCommandId(id);
  consoleLog(`Rows of checksum deleted: ${queryResult1.affectedRows}`);
  consoleLog(`Rows of command execution deleted: ${queryResult2.affectedRows}`);

  process.exit(0);
}

main();
