const fs = require('fs');
const path = require('path');
const { config } = require('./config');

const ignoredFilesAndDirs = config.ignoredFilesAndDirs;

async function getFileList(currentDir) {
  const fileList = new Set();
  async function getFileListRecursive(currentDir) {
    const files = fs.readdirSync(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);

      if (ignoredFilesAndDirs.includes(file)) {
        continue;
      }

      const fileStat = fs.statSync(filePath);

      if (fileStat.isDirectory()) {
        // Recursively process subdirectories
        await getFileListRecursive(filePath);
        continue;
      }
      fileList.add(filePath);
    }
  }
  await getFileListRecursive(currentDir);
  return fileList;
}

async function getFileNameDuplicates(fileList) {
  const files = Array.from(fileList).map(filePath => {
    return [filePath, getFileNameFromPath(filePath)];
  });

  const unique = new Set();
  const duplicates = files.filter(pathFile => {
    const filename = pathFile[1];
    if (unique.has(filename)) {
      return true;
    }
    unique.add(filename);
    return false;
  });

  const result = [];
  for (const duplicate of duplicates) {
    const filename = duplicate[1];
    const locations = [];

    for (const file of files) {
      if (file[1] == filename) {
        locations.push(file[0]);
      }
    }

    result.push({ filename, locations });
  }

  return result;
}

function getFileNameFromPath(filePath) {
  const filePathArray = filePath.split('/');
  return filePathArray[filePathArray.length - 1];
}

function hasDirAccess(directoryPath) {
  try {
    fs.accessSync(directoryPath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  getFileList,
  getFileNameDuplicates,
  getFileNameFromPath,
  hasDirAccess,
};
