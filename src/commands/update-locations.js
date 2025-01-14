const {
  consoleLog,
  consoleLogError,
  consoleLogSuccess,
  print,
  printRed,
  printGreen,
  eol,
} = require('../lib/loggers');
const { getDir, exists } = require('../models/commandExecutions');
const { hasDirAccess, getFileList, searchFileNoCase } = require('../lib/file-management');
const {
  getAllByCommandId,
  replaceLocations,
  deleteByIds,
} = require('../models/checksum');
const { shutDown } = require('../lib/shut-down');
const { receiveCommandExecutionId, ynQuestion } = require('../lib/command-line');

async function run() {
  let commandExecutionId = receiveCommandExecutionId();
  const commandExists = await exists(commandExecutionId);
  if (!commandExists) {
    consoleLogError('That command execution id does not exists');
    process.exit(1);
  }

  const dir = await getDir(commandExecutionId);
  if (!hasDirAccess(dir)) {
    consoleLogError('There are no access to dir: ' + dir);
    process.exit(1);
  }

  const checksums = await getAllByCommandId(commandExecutionId);

  if (checksums.length === 0) {
    consoleLogError('There are no checksums with that command ID');
    process.exit(1);
  }

  const fileListWithReplacements = [];
  const fileListNotFound = [];
  const fileList = await getFileList(dir);

  for (const checksum of checksums) {
    if (!hasDirAccess(checksum.file_path)) {
      printRed('No access to: ');
      print(checksum.file_path);
      eol();

      const newLocation = await searchFileNoCase(fileList, checksum.file);

      if (!newLocation) {
        fileListNotFound.push(checksum);
        printRed('New Location Not Found');
        eol(2);
        continue;
      }

      fileListWithReplacements.push({
        id: checksum.id,
        filePath: checksum.file_path,
        newFilePath: newLocation,
      });

      print('New Location: ');
      printGreen(newLocation);
      eol(2);
    }
  }

  if (fileListWithReplacements.length < 1) {
    consoleLogSuccess('No file locations to replace...');
    eol();
  } else {
    const result = await replaceLocations(fileListWithReplacements);
    consoleLog(result.info);
  }

  if (fileListNotFound.length > 0) {
    consoleLog(
      `There are ${fileListNotFound.length} files that are not found in the dir.`
    );

    const ids = fileListNotFound.map(item => item.id);
    const shouldDelete = await ynQuestion('Want to delete them from the DB?');
    if (shouldDelete) {
      const result = await deleteByIds(ids);
      consoleLog(`Rows of checksum deleted: ${result.affectedRows}`);
    }
  }
  shutDown();
  process.exit(0);
}

run();
