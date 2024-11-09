const { getById } = require('./models/checksum');
const { consoleLog } = require('./loggers');
const { printYellow, printGreen, printBlue, printRed, eol, print } = require('./loggers');

function receiveArguments() {
  const id1 = process.argv[2];
  const id2 = process.argv[3];

  return { id1, id2 };
}

async function main() {
  let { id1, id2 } = receiveArguments();

  const process1 = await getById(id1);
  const process2 = await getById(id2);

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

  print('Process ');
  printYellow(id2);
  print(' has ');
  printGreen(filtered2.length);
  print(' files that are not in process ');
  printYellow(id1);
  eol();

  process.exit(0);
}

main();
