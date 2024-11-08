const { listProcesses } = require('./models/checksum');
const { printYellow, printGreen, printBlue, printRed, eol, print } = require('./loggers');

async function run() {
  const checksums = await listProcesses();

  for (const checksum of checksums) {
    const sourceSplitted = checksum.source.split('/');
    const sourceFinalDir = sourceSplitted[sourceSplitted.length - 1];
    printYellow(checksum.command_execution_id.toString() + ' ');
    printRed(sourceFinalDir + ' ');
    printGreen(checksum.source + ' ');
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
