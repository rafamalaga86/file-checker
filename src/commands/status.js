const {
  consoleLogSuccess,
  print,
  printYellow,
  eol,
  consoleLog,
} = require('../lib/loggers');
const { getProcessesWithoutChecksums, getAllFailed } = require('../models/checksum');

async function run() {
  const executionsNoChecksum = await getProcessesWithoutChecksums();

  if (executionsNoChecksum.length < 1) {
    consoleLog('All executions have checksums associated');
  } else {
    print('Processes without checksums: ');
    printYellow(executionsNoChecksum.map(item => item.id).join(', '));
    eol();
  }
  eol();

  const allFailed = await getAllFailed();
  if (allFailed.length === 0) {
    consoleLog('There are no failed checksums');
  } else {
    for (const item of allFailed) {
      print('Process: ');
      printYellow(item.command_execution_id);
      print(' | Number of failed checksums: ');
      printYellow(item.failed_number);
      eol();
    }
  }

  process.exit(0);
}

run();
