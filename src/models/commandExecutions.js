const { getDbConnection } = require('../lib/db');

async function startCommandExecution(dir) {
  const connection = await getDbConnection();
  const commandStartTime = new Date();
  // Insert command execution data into the database FIRST

  const [result] = await connection.execute(
    'INSERT INTO command_executions (created_at, status, dir) VALUES (?, ?, ?)',
    [commandStartTime, 'running', dir]
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

async function getDir(commandExecutionId) {
  const connection = await getDbConnection();
  const [result] = await connection.execute(
    'SELECT dir FROM command_executions WHERE id = ?',
    [commandExecutionId]
  );
  return result[0].dir;
}

module.exports = { startCommandExecution, finishCommandExecution, getDir };
