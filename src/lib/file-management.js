const fs = require('fs');
const path = require('path');
const { config } = require('../config/config');

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
  return Array.from(fileList);
}

async function searchFileNoCase(fileList, fileName) {
  return fileList.find(filePath =>
    filePath.toLowerCase().includes(fileName.toLowerCase())
  );
}

async function getFileNameDuplicates(fileList) {
  const files = fileList.map(filePath => {
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

function hasDirAccess(dir) {
  try {
    fs.accessSync(dir, fs.constants.F_OK);
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
  searchFileNoCase,
};
