const { listProcesses } = require('../models/checksum');
const {
  printYellow,
  printGreen,
  printBlue,
  printRed,
  eol,
  print,
} = require('../lib/loggers');

async function run() {
  const checksums = await listProcesses();

  for (const checksum of checksums) {
    const dirSplitted = checksum.dir.split('/');
    const finalDir = dirSplitted[dirSplitted.length - 1];

    printYellow(checksum.command_execution_id.toString() + ' ');
    printRed(finalDir + ' ');
    printGreen(checksum.dir + ' ');
    print(checksum.status + ' ');
    printBlue(checksum.created_at.toISOString() + ' ');

    if (checksum.ended_at) {
      process.stdout.write(' ');
      process.stdout.write(checksum.ended_at.toISOString());
    }
    eol();
  }

  process.exit(0);
}

run();
