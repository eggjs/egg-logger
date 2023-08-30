'use strict';

const Logger = require('../logger');
const ConsoleTransport = require('../transports/console');
const utils = require('../utils');

/**
 * Terminal Logger, send log to console.
 */
class ConsoleLogger extends Logger {

  /**
   * @param {Object} options
   * - {String} [encoding] - log string encoding, default is 'utf8'
   */
  constructor(options) {
    super(options);

    this.set('console', new ConsoleTransport({
      level: this.options.level,
      formatter: utils.consoleFormatter,
      maxCauseChainLength: this.options.maxCauseChainLength,
    }));
  }

  get defaults() {
    return {
      encoding: 'utf8',
      level: process.env.NODE_CONSOLE_LOGGRE_LEVEL || (process.env.NODE_ENV === 'production' ? 'INFO' : 'WARN'),
      maxCauseChainLength: 10,
    };
  }

}

module.exports = ConsoleLogger;
