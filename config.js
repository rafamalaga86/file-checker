const config = {
  ignoredFilesAndDirs: [
    '.DS_Store',
    '.Trashes',
    '.DocumentRevisions-V100',
    '.Spotlight-V100',
    '.TemporaryItems',
    '.sync.ffs_db',
  ],
  dbConfig: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'file-checker',
    port: 6666,
  },
};

module.exports = { config };
