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

module.exports = { getFileList };
