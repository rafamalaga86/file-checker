const {
  printYellow,
  printGreen,
  printBlue,
  printRed,
  eol,
  print,
} = require('../lib/loggers');

function printList(rows) {
  const sortedRows = rows.sort((item1, item2) =>
    item1.finalDir.localeCompare(item2.finalDir)
  );
  for (const checksum of sortedRows) {
    printYellow(checksum.id + ' ');
    printRed(checksum.finalDir + ' ');
    print(checksum.dir + ' ');
    printGreen(checksum.status + ' ');
    print(checksum.checksum_count.toString() + ' checksums');

    if (checksum.failed) {
      printRed(' ' + checksum.failed + ' checksum errors');
    }

    // printBlue(checksum.created_at.toISOString() + ' ');

    // if (checksum.ended_at) {
    //   process.stdout.write(' ');
    //   process.stdout.write(checksum.ended_at.toISOString());
    // }
    eol();
  }
}

module.exports = { printList };
