const { closeConnection } = require('./db');

function shutDown() {
  closeConnection();
}

module.exports = { shutDown };
