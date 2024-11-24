const { status } = require('../enums/status');
const {
  printYellow,
  printGreen,
  printRed,
  eol,
  print,
  printCyan,
  printMagenta,
  printGray,
  printBlue,
} = require('../lib/loggers');

function getLowestId(country, rows) {
  let lowestId = Infinity;
  for (const item of rows) {
    if (item.finalDir === country && item.id < lowestId) {
      lowestId = item.id;
    }
  }
  return lowestId;
}

function printList(rows) {
  const sortedRows = rows.sort((a, b) => {
    const orderA = getLowestId(a.finalDir, rows);
    const orderB = getLowestId(b.finalDir, rows);

    if (orderA !== orderB) {
      return orderA - orderB;
    } else {
      // Si los países son iguales, ordenar por ID
      return a.id - b.id;
    }
  });
  let lastFinalDir = null;
  for (const checksum of sortedRows) {
    if (!lastFinalDir) {
      lastFinalDir = checksum.finalDir;
    }
    if (lastFinalDir !== checksum.finalDir) {
      lastFinalDir = checksum.finalDir;
      eol();
    }
    printYellow(checksum.id + ' ');
    printCyan(checksum.finalDir + ' ');
    printDir(checksum.dir);
    print(' ');
    let statusPrint = printGreen;
    if (checksum.status !== status.SUCCESS) {
      statusPrint = printYellow;
    }
    statusPrint(checksum.status + ' ');
    print(checksum.checksum_count.toString() + ' checksums');

    if (checksum.checksum_count === 0) {
      printRed(' This execution has 0 checksums');
    }

    if (checksum.failed) {
      printRed(' ' + checksum.failed + ' checksum errors');
    }
    eol();
  }
}

function printDir(dir) {
  const dirArray = dir.split('/');
  let index = 0;
  for (const item of dirArray) {
    if (index === 2) {
      printItsColor(item);
    } else {
      print(item);
    }
    // If is not last item
    if (item !== dirArray[dirArray.length - 1]) {
      print('/');
    }
    index++;
  }
}

const colors = [
  printGray,
  printGreen,
  printMagenta,
  printYellow,
  printCyan,
  printRed,
  printBlue,
];
const dirColor = {};

function getNextColorFunc() {
  const firstElement = colors.shift(); // Remove the first element
  colors.push(firstElement); // Push it to the last
  return firstElement;
}

function printItsColor(dir) {
  if (!(dir in dirColor)) {
    dirColor[dir] = getNextColorFunc();
  }
  const printFunction = dirColor[dir];
  printFunction(dir);
}

module.exports = { printList };
