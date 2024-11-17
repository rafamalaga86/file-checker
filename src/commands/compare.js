const { getByCommandId } = require('../models/checksum');
const {
  printYellow,
  printGreen,
  consoleLogError,
  eol,
  print,
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

async function main() {
  let { id1, id2 } = receiveArguments();

  const command1Exists = await exists(id1);
  if (!command1Exists) {
    consoleLogError('The FIRST command execution id does not exists');
    process.exit(1);
  }
  const command2Exists = await exists(id2);
  if (!command2Exists) {
    consoleLogError('The SECOND command execution id does not exists');
    process.exit(1);
  }

  const process1 = await getByCommandId(id1);
  const process2 = await getByCommandId(id2);

  const process1Stringified = process1.map(item => JSON.stringify(item));
  const process2Stringified = process2.map(item => JSON.stringify(item));

  const filtered1 = process1Stringified.filter(x => !process2Stringified.includes(x));
  const filtered2 = process2Stringified.filter(x => !process1Stringified.includes(x));

  print('Process ');
  printYellow(id1);
  print(' has ');
  printGreen(process1.length + ' ');
  print('files');
  eol();

  print('Process ');
  printYellow(id2);
  print(' has ');
  printGreen(process2.length + ' ');
  print('files');
  eol();
  eol();

  print('Process ');
  printYellow(id1);
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
  process.exit(0);
}

main();
