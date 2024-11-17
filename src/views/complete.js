const { print, eol, printGreen, printRed, consoleLogSuccess } = require('../lib/loggers');

function statusView(fileNumber, dir, dbFilesNumber, remainingFiles) {
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
    consoleLogSuccess('File list is up to date');
    return;
  }
  print('There are ');
  printRed(remainingFiles);
  print(' files to complete');
  eol();
}

module.exports = { statusView };
