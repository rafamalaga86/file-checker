const {
  print,
  eol,
  printGreen,
  printRed,
  consoleLogSuccess,
  printYellow,
} = require('../lib/loggers');

function statusView(fileNumber, dir, dbFilesNumber, remainingFiles, extraFilesNumber) {
  print('Found ');
  printGreen(fileNumber);
  print(' files in ');
  printGreen(dir);
  eol();
  print('Found ');
  printGreen(dbFilesNumber);
  print(' files in the database');
  eol();

  if (remainingFiles === 0) {
    consoleLogSuccess('All files in the dir are in the DB');
  } else {
    print('There are ');
    printYellow(remainingFiles);
    print(' files to complete');
    eol();
  }

  if (extraFilesNumber) {
    print('There are ');
    printRed(extraFilesNumber);
    print(' files in the DB that cannot be found in the directory');
    eol();
  }
}

module.exports = { statusView };
