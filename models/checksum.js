const { getDbConnection } = require('../db');

async function registerChecksum(
  directoryPath,
  filePath,
  checksum,
  commandExecutionId,
  stdoutString,
  stderrString
) {
  const connection = await getDbConnection();

  // Insert checksum data into the database
  const [result] = await connection.execute(
    'INSERT INTO checksums (source, file_path, checksum, command_execution_id, stdout, stderr) VALUES (?, ?, ?, ?, ?, ?)',
    [directoryPath, filePath, checksum, commandExecutionId, stdoutString, stderrString]
  );

  return result.insertId;
}

module.exports = { registerChecksum };
