async function startCommandExecution() {
  // Insert command execution data into the database FIRST
  const [result] = await connection.execute(
    'INSERT INTO command_executions (created_at, status) VALUES (?, ?, ?, ?)',
    [commandStartTime, '', '', 'running']
  );
  return result.insertId; // Assign commandExecutionId here
}

async function finishCommandExecution(commandExecutionId, status) {
  const commandEndTime = new Date();
  await connection.execute(
    'UPDATE command_executions SET status = ?, ended_at = ? WHERE id = ?',
    [status, commandEndTime, commandExecutionId]
  );
}

module.exports = { startCommandExecution, finishCommandExecution };
