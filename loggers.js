function consoleLogError(message) {
  const red = '\x1b[31m';
  const reset = '\x1b[0m';
  console.error(red + message + reset);
}

function consoleLog(message) {
  console.log(message);
}

module.exports = { consoleLog, consoleLogError };
