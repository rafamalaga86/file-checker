const { getDbConnection } = require('../db');

async function startCommandExecution() {
  const connection = await getDbConnection();
  const commandStartTime = new Date();
  // Insert command execution data into the database FIRST

  const [result] = await connection.execute(
    'INSERT INTO command_executions (created_at, status) VALUES (?, ?)',
    [commandStartTime, 'running']
  );
  return result.insertId; // Assign commandExecutionId here
}

async function finishCommandExecution(commandExecutionId, status) {
  const connection = await getDbConnection();
  const commandEndTime = new Date();
  await connection.execute(
    'UPDATE command_executions SET status = ?, ended_at = ? WHERE id = ?',
    [status, commandEndTime, commandExecutionId]
  );
}

async function getDirectoryPath(commandExecutionId) {
  const connection = await getDbConnection();
  const [result] = await connection.execute(
    'SELECT source FROM checksums WHERE command_execution_id = ?',
    [commandExecutionId]
  );
  return result[0].source;
}

module.exports = { startCommandExecution, finishCommandExecution, getDirectoryPath };
