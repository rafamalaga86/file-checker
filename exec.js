const { spawnSync } = require('node:child_process');

function exec(cmd, args) {
  const processResult = spawnSync(cmd, args, {
    encoding: 'utf8',
    shell: true,
  });
  return processResult;
}

module.exports = { exec };
