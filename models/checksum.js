async function registerChecksum(
  directoryPath,
  filePath,
  checksum,
  commandExecutionId,
  stdoutString,
  stderrString
) {
  // Insert checksum data into the database
  const [result] = await connection.execute(
    'INSERT INTO checksum (source, file, checksum, command_execution_id, stdout, stderr) VALUES (?, ?, ?, ?)',
    [directoryPath, filePath, checksum, commandExecutionId, stdoutString, stderrString]
  );

  return result.id;
}

module.exports = { registerChecksum };
