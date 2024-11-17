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

module.exports = { confirmOrAbort };
