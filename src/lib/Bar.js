const { print, printGreen, printYellow } = require('./loggers');

class ProgressBar {
  constructor(max, dir, executionId) {
    this.#dir = dir;
    this.#executionId = executionId;
    this.#max = max;
    this.#unit = 0;
  }

  #dir;
  #executionId;
  #max;
  #unit;

  #getPercentage() {
    return Math.round((this.#unit / this.#max) * 100);
  }

  print() {
    printGreen(`${this.#getPercentage()}%`);
    printYellow(` ${this.#dir}`);
    print(' Execution ID: ');
    printGreen(`${this.#executionId}`);
  }

  increment() {
    this.#unit++;
  }
}

module.exports = { ProgressBar };
