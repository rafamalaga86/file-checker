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

module.exports = { registerChecksum };
