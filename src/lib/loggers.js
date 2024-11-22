function consoleLogError(message) {
  const red = '\x1b[31m';
  const reset = '\x1b[0m';
  console.error(red + message + reset);
}
function consoleLogSuccess(message) {
  const green = '\x1b[32m';
  const reset = '\x1b[0m';
  console.error(green + message + reset);
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

function printArray(array) {
  for (const string of array) {
    console.log(string);
  }
}

function printYellow(message) {
  const yellow = '\x1b[33m';
  print(message, yellow);
}

function printGray(message) {
  const gray = '\x1b[90m';
  print(message, gray);
}

function printRed(message) {
  const red = '\x1b[31m';
  print(message, red);
}

function printMagenta(message) {
  const magenta = '\x1b[35m';
  print(message, magenta);
}

function printCyan(message) {
  const cyan = '\x1b[36m';
  print(message, cyan);
}

function printBlue(message) {
  const blue = '\x1b[34m';
  print(message, blue);
}

function printGreen(message) {
  const green = '\x1b[32m';
  print(message, green);
}
function eol(iterations = 1) {
  for (let i = 0; i < iterations; i++) {
    print('\n');
  }
}

module.exports = {
  consoleLog,
  consoleLogError,
  consoleLogSuccess,
  printYellow,
  printRed,
  printMagenta,
  printGray,
  printCyan,
  printBlue,
  printGreen,
  print,
  printArray,
  eol,
};
