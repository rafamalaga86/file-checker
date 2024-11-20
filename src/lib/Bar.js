const { eol } = require('./loggers');

class ProgressBar {
  constructor(max) {
    this.#max = max;
    this.#unit = 0;
  }

  #max;
  #unit;

  #getPercentage() {
    return Math.round((this.#unit / this.#max) * 100);
  }

  print() {
    process.stdout.write(`${this.#getPercentage()}%`);
  }

  increment() {
    this.#unit++;
  }
}

module.exports = { ProgressBar };
