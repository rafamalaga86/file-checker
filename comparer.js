const { getById } = require('./models/checksum');

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

  const filtered = process1Stringified.filter(x => !process2Stringified.includes(x));
  const filtered2 = process2Stringified.filter(x => !process1Stringified.includes(x));

  console.log(process1.length, process2.length);
  console.log(filtered.length, filtered2.length);
  process.exit(1);
}

main();
