const { consoleLogError } = require('./loggers');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function confirmOrAbort() {
  await new Promise(resolve => {
    readline.question('\nDo you wish to continue? (y/n) ', response => {
      response = response.toLowerCase();
      if (response === 'y' || response === 'yes') {
        readline.close();
        resolve(true);
      } else {
        console.log('Aborting...\n');
        readline.close();
        process.exit(0);
      }
    });
  });
}

function receiveCommandExecutionId() {
  const argument = process.argv[2];

  if (!argument) {
    consoleLogError('Error: Please provide a command execution ID as a parameter');
    process.exit(1);
  }
  const commandExecutionId = Number(argument);

  if (isNaN(commandExecutionId) || commandExecutionId < 1) {
    consoleLogError('Error: The parameter should be a valid command execution id');
    process.exit(1);
  }
  return commandExecutionId;
}

module.exports = { confirmOrAbort, receiveCommandExecutionId };