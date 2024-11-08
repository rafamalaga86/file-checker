const databases = {
  prodDbConfig: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'file-checker',
    port: 6666,
  },
  testDbConfig: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'file-checker-test',
    port: 6666,
  },
};

const config = {
  ignoredFilesAndDirs: [
    '.DS_Store',
    '.Trashes',
    '.DocumentRevisions-V100',
    '.Spotlight-V100',
    '.TemporaryItems',
    '.sync.ffs_db',
    'sync.ffs_lock',
    '.fseventsd',
  ],
  dbConfig: databases.prodDbConfig,
};

module.exports = { config };
