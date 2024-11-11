require('dotenv').config();

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
  dbConfig: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
};

module.exports = { config };
