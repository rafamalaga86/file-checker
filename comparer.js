const { getById } = require('./models/checksum');
const { consoleLog } = require('./loggers');

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

  consoleLog(`Process ${id1} has ${process1.length} files.`);
  consoleLog(`Process ${id2} has ${process2.length} files.`);
  consoleLog(
    `Process ${id1} has ${filtered1.length} files that are not in process ${id2}`
  );
  consoleLog(
    `Process ${id2} has ${filtered2.length} files that are not in process ${id1}`
  );
  process.exit(0);
}

main();
