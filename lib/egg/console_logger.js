'use strict';

const Logger = require('../logger');
const ConsoleTransport = require('../transports/console');
const FileTransport = require('../transports/file');
const utils = require('../utils');

/**
 * Terminal Logger, send log to console.
 */
class ConsoleLogger extends Logger {

  /**
   * @constructor
   * @param {Object} options
   * - {String} [errorFile] - error file
   *   if specify this file, logger will redirect error log to the file.
   * - {String} [encoding] - log string encoding, default is 'utf8'
   */
  constructor(options) {
    super(options);

    this.set('console', new ConsoleTransport({
      level: this.options.level,
      formatter: utils.consoleFormatter,
    }));

    if (this.options.errorFile) {
      const fileTransport = new FileTransport({
        file: this.options.errorFile,
        level: 'ERROR', // 只输出 error 级别的到文件
        encoding: this.options.encoding,
        formatter: utils.defaultFormatter,
      });
      this.set('file', fileTransport);
    }
  }

  get defaults() {
    return {
      errorFile: '',
      encoding: 'utf8',
      level: process.env.NODE_ENV === 'production' ? 'INFO' : 'WARN',
    };
  }

}

module.exports = ConsoleLogger;
