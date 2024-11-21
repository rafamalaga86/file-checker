const { consoleLogError, eol, print, printGreen } = require('../lib/loggers');
const { getDbConnection } = require('../lib/db');
const { getFileNameFromPath } = require('../lib/file-management');
const { exec } = require('../lib/exec');
const { clearLastLine } = require('../lib/command-line');

async function registerChecksum(
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
    'INSERT INTO checksums (file_path, file, checksum, command_execution_id, stdout, stderr) VALUES (?, ?, ?, ?, ?, ?)',
    [filePath, file, checksum, commandExecutionId, stdoutString, stderrString]
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
    `SELECT command_executions.id, dir, status, created_at, ended_at, count(checksums.id) AS checksum_count
	  FROM checksums
    RIGHT JOIN command_executions ON command_executions.id = checksums.command_execution_id
    GROUP BY command_executions.id, dir, status, created_at, ended_at
    ORDER BY command_executions.id
    ;`
  );

  return result;
}
async function getProcessesWithoutChecksums() {
  const connection = await getDbConnection();

  // Insert checksum data into the database
  const [result] = await connection.execute(
    `SELECT ce.id
    FROM command_executions ce
    LEFT JOIN checksums c ON ce.id = c.command_execution_id
    WHERE c.command_execution_id IS NULL
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

async function getFilePathByCommandId(commandExecutionId) {
  const connection = await getDbConnection();

  // Insert checksum data into the database
  const [result] = await connection.execute(
    'SELECT file_path FROM checksums WHERE command_execution_id = ?',
    [commandExecutionId]
  );

  return result.map(item => item.file_path);
}
async function getAllByCommandId(commandExecutionId) {
  const connection = await getDbConnection();

  // Insert checksum data into the database
  const [result] = await connection.execute(
    'SELECT * FROM checksums WHERE command_execution_id = ?',
    [commandExecutionId]
  );

  return result;
}

async function getFailedByCommandId(commandExecutionId) {
  const connection = await getDbConnection();

  // Insert checksum data into the database
  const [result] = await connection.execute(
    "SELECT file_path FROM checksums WHERE command_execution_id = ? AND checksum = ''",
    [commandExecutionId]
  );

  return result;
}

async function countFailedByCommandId(commandExecutionId) {
  const connection = await getDbConnection();

  // Insert checksum data into the database
  const [result] = await connection.execute(
    "SELECT count(file_path) as amount FROM checksums WHERE command_execution_id = ? AND checksum = ''",
    [commandExecutionId]
  );

  return result[0].amount;
}

async function getAllFailed() {
  const connection = await getDbConnection();

  // Insert checksum data into the database
  const [result] = await connection.execute(
    "SELECT command_execution_id, count(*) as failed_number FROM checksums WHERE checksum = '' GROUP BY (command_execution_id);"
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
    const [queryResult1] = await connection.execute(
      `DELETE FROM checksums WHERE command_execution_id = ?`,
      [commandExecutionId]
    );

    const [queryResult2] = await connection.execute(
      `DELETE FROM command_executions WHERE ID = ?`,
      [commandExecutionId]
    );

    await connection.commit();

    return { queryResult1, queryResult2 };
  } catch (error) {
    // If something fails, roll back
    await connection.rollback();
    throw error;
  }
}

async function replaceLocations(fileListWithReplacements) {
  const ids = fileListWithReplacements.map(obj => obj.id);
  const cases = fileListWithReplacements
    .map(obj => `WHEN id = ${obj.id} THEN '${obj.newFilePath}'`)
    .join(' ');

  const connection = await getDbConnection();
  const [result] = await connection.execute(`
  UPDATE checksums
  SET file_path = CASE 
    ${cases}
    END
  WHERE id IN (${ids.join(',')});`);

  return result;
}

async function calculateChecksumOfFileList(commandExecutionId, fileList, bar) {
  if (fileList.length === 0) {
    consoleLogError('The file list is empty');
    return;
  }

  print('Launched command process with ID: ');
  printGreen(commandExecutionId);
  eol();
  eol();

  let index = 0;
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

    const id = await registerChecksum(
      filePath,
      checksum,
      commandExecutionId,
      stdoutString,
      stderrString
    );

    clearLastLine();
    print('ID: ');
    printGreen(id);
    print(' | ' + fileName + ' -> ');
    printGreen(checksum);

    eol();
    bar.increment();
    bar.print();
    index++;
  }
  eol();
  // bar.stop();
}

module.exports = {
  registerChecksum,
  getById,
  getByCommandId,
  listProcesses,
  replaceLocations,
  deleteByCommandId,
  calculateChecksumOfFileList,
  getByCommandId,
  getAllByCommandId,
  getFailedByCommandId,
  countFailedByCommandId,
  deleteFailedByCommandId,
  getFilePathByCommandId,
  getProcessesWithoutChecksums,
  getAllFailed,
};
