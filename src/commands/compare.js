const { getByCommandId } = require('../models/checksum');
const { getById } = require('../models/commandExecutions');
const {
  printYellow,
  printGreen,
  consoleLogError,
  eol,
  print,
  printCyan,
} = require('../lib/loggers');
const { exists } = require('../models/commandExecutions');

function receiveArguments() {
  const id1 = process.argv[2];
  const id2 = process.argv[3];

  if (!id1 || !id2) {
    consoleLogError('Error: Please provide TWO command execution ID.');
    process.exit(1);
  }

  return { id1, id2 };
}

async function run() {
  let { id1, id2 } = receiveArguments();

  const command1 = await getById(id1);
  const command2 = await getById(id2);
  if (!command1) {
    consoleLogError('The FIRST command execution id does not exists');
    process.exit(1);
  }
  if (!command2) {
    consoleLogError('The SECOND command execution id does not exists');
    process.exit(1);
  }

  const execution1ChecksumsComplete = await getByCommandId(id1);
  const execution2ChecksumsComplete = await getByCommandId(id2);

  const execution1Checksum = execution1ChecksumsComplete.map(item => ({
    file: item.file,
    checksum: item.checksum,
  }));
  const execution2Checksums = execution2ChecksumsComplete.map(item => ({
    file: item.file,
    checksum: item.checksum,
  }));

  const process1Stringified = execution1Checksum.map(item => JSON.stringify(item));
  const process2Stringified = execution2Checksums.map(item => JSON.stringify(item));

  const filtered1 = process1Stringified.filter(x => !process2Stringified.includes(x));
  const filtered2 = process2Stringified.filter(x => !process1Stringified.includes(x));

  print('Process ');
  printYellow(id1);
  print(' ');
  printCyan(command1.dir);
  print(' has ');
  printGreen(execution1Checksum.length + ' ');
  print('files');
  eol();

  print('Process ');
  printYellow(id2);
  print(' ');
  printCyan(command2.dir);
  print(' has ');
  printGreen(execution2Checksums.length + ' ');
  print('files');
  eol();
  eol();

  print('Process ');
  printYellow(id1);
  print(' ');
  printCyan(command1.dir);
  print(' has ');
  printGreen(filtered1.length);
  print(' files that are not in process ');
  printYellow(id2);
  eol();

  if (filtered1.length > 0) {
    print('Showing them: ');
    eol();
    console.log(filtered1);
  }

  print('Process ');
  printYellow(id2);
  print(' ');
  printCyan(command2.dir);
  print(' has ');
  printGreen(filtered2.length);
  print(' files that are not in process ');
  printYellow(id1);
  eol();

  if (filtered2.length > 0) {
    print('Showing them: ');
    eol();
    console.log(filtered2);
  }

  if (!filtered1.length && !filtered2.length) {
    printGreen(`
██████╗ ███████╗██████╗ ███████╗███████╗ ██████╗████████╗    ███╗   ███╗ █████╗ ████████╗ ██████╗██╗  ██╗
██╔══██╗██╔════╝██╔══██╗██╔════╝██╔════╝██╔════╝╚══██╔══╝    ████╗ ████║██╔══██╗╚══██╔══╝██╔════╝██║  ██║
██████╔╝█████╗  ██████╔╝█████╗  █████╗  ██║        ██║       ██╔████╔██║███████║   ██║   ██║     ███████║
██╔═══╝ ██╔══╝  ██╔══██╗██╔══╝  ██╔══╝  ██║        ██║       ██║╚██╔╝██║██╔══██║   ██║   ██║     ██╔══██║
██║     ███████╗██║  ██║██║     ███████╗╚██████╗   ██║       ██║ ╚═╝ ██║██║  ██║   ██║   ╚██████╗██║  ██║
╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝ ╚═════╝   ╚═╝       ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
                                                                                                         
`);
    eol();
  }

  process.exit(0);
}

run();
