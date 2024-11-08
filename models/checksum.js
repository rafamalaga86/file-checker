const { getDbConnection } = require('../db');
const { getFileNameFromPath } = require('../file-management');

async function registerChecksum(
  directoryPath,
  filePath,
  checksum,
  commandExecutionId,
  stdoutString,
  stderrString
) {
  const connection = await getDbConnection();
  const file = getFileNameFromPath(filePath);

  // Insert checksum data into the database
  const [result] = await connection.execute(
    'INSERT INTO checksums (source, file_path, file, checksum, command_execution_id, stdout, stderr) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      directoryPath,
      filePath,
      file,
      checksum,
      commandExecutionId,
      stdoutString,
      stderrString,
    ]
  );

  return result.insertId;
}

async function getById(id) {
  const connection = await getDbConnection();

  // Insert checksum data into the database
  const [result] = await connection.execute(
    'SELECT file, checksum FROM checksums WHERE command_execution_id = ?',
    [id]
  );

  return result;
}

module.exports = { registerChecksum, getById };
