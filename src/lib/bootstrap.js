const { getDbConnection } = require('./db');

try {
  // Start DB Connection
  await getDbConnection();
} catch (err) {
  if (err.code === 'ECONNREFUSED') {
    consoleLogError('Could not make a successful connection to the database.');
    process.exit(1);
  }
  throw err;
}
