const { consoleLogError } = require('../lib/loggers');
const { listProcesses } = require('../models/checksum');
const { printList } = require('../views/list');

async function run() {
  const checksums = await listProcesses();
  const rows = [];

  if (!checksums.length) {
    consoleLogError('There are no checksums to list');
    process.exit(1);
  }

  for (const checksum of checksums) {
    const dirSplitted = checksum.dir.split('/');
    let finalDir = dirSplitted[dirSplitted.length - 1];
    if (finalDir === '') {
      finalDir = dirSplitted[dirSplitted.length - 2];
    }
    rows.push({ ...checksum, finalDir });
  }

  printList(rows);
  process.exit(0);
}

run();
