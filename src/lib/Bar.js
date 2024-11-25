const { print, printGreen, printYellow, printMagenta } = require('./loggers');

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
    printMagenta(`${this.#getPercentage()}%`);
    print(` ${this.#unit}/${this.#max} `);
    printYellow(` ${this.#dir}`);
    print(' Execution ID: ');
    printYellow(`${this.#executionId}`);
  }

  increment() {
    this.#unit++;
  }
}

module.exports = { ProgressBar };
