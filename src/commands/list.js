const { listProcesses } = require('../models/checksum');
const { printList } = require('../views/list');

async function run() {
  const checksums = await listProcesses();
  const rows = [];

  for (const checksum of checksums) {
    const dirSplitted = checksum.dir.split('/');
    const finalDir = dirSplitted[dirSplitted.length - 1];
    rows.push({ ...checksum, finalDir });
  }

  printList(rows);
  process.exit(0);
}

run();
