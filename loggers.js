function consoleLogError(message) {
  const red = '\x1b[31m';
  const reset = '\x1b[0m';
  console.error(red + message + reset);
}

function consoleLog(...message) {
  console.log(...message);
}

function print(message, color) {
  if (color) {
    const reset = '\x1b[0m';
    process.stdout.write(color + message + reset);
    return;
  }
  process.stdout.write(message);
}

function printYellow(message) {
  const yellow = '\x1b[33m';
  print(message, yellow);
}

function printRed(message) {
  const red = '\x1b[31m';
  print(message, red);
}

function printBlue(message) {
  const blue = '\x1b[34m';
  print(message, blue);
}

function printGreen(message) {
  const green = '\x1b[32m';
  print(message, green);
}
function eol() {
  print('\n');
}

module.exports = {
  consoleLog,
  consoleLogError,
  printYellow,
  printRed,
  printBlue,
  printGreen,
  print,
  eol,
};
