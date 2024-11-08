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
    } else {
      unique.add(filename);
      return false;
    }
  });

  return duplicates;
}

function getFileNameFromPath(filePath) {
  const filePathArray = filePath.split('/');
  return filePathArray[filePathArray.length - 1];
}

module.exports = { getFileList, getFileNameDuplicates, getFileNameFromPath };
