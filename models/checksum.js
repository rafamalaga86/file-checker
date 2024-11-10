const { consoleLogError, consoleLog } = require('../loggers');
const { getDbConnection } = require('../db');
const { getFileNameFromPath } = require('../file-management');
const { exec } = require('../exec');

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

async function listProcesses() {
  const connection = await getDbConnection();

  // Insert checksum data into the database
  const [result] = await connection.execute(
    `SELECT DISTINCT command_execution_id, source, status, created_at, ended_at
    FROM checksums
    JOIN command_executions ON command_executions.id = checksums.command_execution_id
    ORDER BY command_execution_id
    ;`
  );

  return result;
}

async function getByCommandId(commandExecutionId) {
  const connection = await getDbConnection();

  // Insert checksum data into the database
  const [result] = await connection.execute(
    'SELECT file, checksum FROM checksums WHERE command_execution_id = ?',
    [commandExecutionId]
  );

  return result;
}
async function getFailedByCommandId(commandExecutionId) {
  const connection = await getDbConnection();

  // Insert checksum data into the database
  const [result] = await connection.execute(
    "SELECT file_path, source FROM checksums WHERE command_execution_id = ? AND checksum = ''",
    [commandExecutionId]
  );

  return result;
}

async function deleteFailedByCommandId(commandExecutionId) {
  const connection = await getDbConnection();

  const [result] = await connection.execute(
    "DELETE FROM checksums WHERE command_execution_id = ? AND checksum = ''",
    [commandExecutionId]
  );

  return result;
}

async function deleteByCommandId(commandExecutionId) {
  const connection = await getDbConnection();

  await connection.beginTransaction();

  try {
    // Eliminar de la tabla checksums
    const [queryResult1] = await connection.execute(
      `DELETE FROM checksums WHERE command_execution_id = ?`,
      [commandExecutionId]
    );

    // Eliminar de la tabla command_executions
    const [queryResult2] = await connection.execute(
      `DELETE FROM command_executions WHERE ID = ?`,
      [commandExecutionId]
    );

    // Si ambas queries se ejecutaron correctamente, hacer commit de la transacción
    await connection.commit();

    return { queryResult1, queryResult2 };
  } catch (error) {
    // Si algo falla, revertir la transacción
    await connection.rollback();
    throw error;
  }
}

async function calculateChecksumOfFileList(commandExecutionId, fileList, directoryPath) {
  consoleLog(`Launched command process with ID: ${commandExecutionId}`);

  for (const filePath of fileList) {
    const fileName = getFileNameFromPath(filePath);
    let checksum;

    const commandResult = await exec(`sha256sum "${filePath}"`);

    const stdoutString = commandResult.stdout.toString();
    const stderrString = commandResult.stderr.toString();
    const stdout = stdoutString.split('  ');
    checksum = stdout[0];

    if (stderrString) {
      consoleLogError(`Error calculating checksum for ${filePath}:`, stderrString);
    }
    if (checksum) {
      consoleLog(`${fileName} -> ${checksum}`);
    }

    const id = await registerChecksum(
      directoryPath,
      filePath,
      checksum,
      commandExecutionId,
      stdoutString,
      stderrString
    );

    consoleLog(`Inserted checksum with ID: ${id}`);
  }
  await finishCommandExecution(commandExecutionId, 'success');
  consoleLog('File check completed successfully.');
}

module.exports = {
  registerChecksum,
  getById,
  getByCommandId,
  listProcesses,
  deleteByCommandId,
  calculateChecksumOfFileList,
  getByCommandId,
  getFailedByCommandId,
  deleteFailedByCommandId,
};
