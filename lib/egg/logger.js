'use strict';

const Logger = require('../logger');
const utils = require('../utils');
const FileTransport = require('../transports/file');
const FileBufferTransport = require('../transports/file_buffer');
const ConsoleTransport = require('../transports/console');

/**
 * Support three transports: Console, File and JSON File
 */

class EggLogger extends Logger {
  /**
   * @constructor
   * @param {Object} options
   *  - {String} file - log file
   *  - {String} [encoding = utf8] - log string encoding
   *  - {String} [level = INFO] - file log level
   *  - {String} [consoleLevel = NONE] - console log level
   *  - {Function} [formatter] - log format function
   *  - {String} [jsonFile] - JSON log file
   *  - {Boolean} [outputJSON = false] - send JSON log or not
   *  - {Boolean} [buffer] - use {@link FileBufferTransport} or not
   *  - {String} [eol] - end of line char
   */
  constructor(options) {
    super(options);

    if (this.options.outputJSON === true && this.options.file) {
      this.options.jsonFile = this.options.file.replace(/\.log$/, '.json.log');
    }

    const EggFileTransport = this.options.buffer === true ? FileBufferTransport : FileTransport;

    const fileTransport = new EggFileTransport({
      file: this.options.file,
      level: this.options.level || 'INFO',
      encoding: this.options.encoding,
      formatter: this.options.formatter,
      flushInterval: this.options.flushInterval,
      eol: this.options.eol,
    });
    this.set('file', fileTransport);

    if (this.options.jsonFile) {
      const jsonFileTransport = new EggFileTransport({
        file: this.options.jsonFile,
        level: this.options.level,
        encoding: this.options.encoding,
        flushInterval: this.options.flushInterval,
        json: true,
        eol: this.options.eol,
      });
      this.set('jsonFile', jsonFileTransport);
    }

    const consoleTransport = new ConsoleTransport({
      level: this.options.consoleLevel,
      formatter: utils.consoleFormatter,
      eol: this.options.eol,
    });
    this.set('console', consoleTransport);
  }

  get level() {
    return this.options.level;
  }
  set level(level) {
    this.options.level = level;
    for (const transport of this.values()) {
      if (transport instanceof ConsoleTransport) continue;
      transport.level = level;
    }
  }

  get consoleLevel() {
    return this.options.consoleLevel;
  }
  set consoleLevel(level) {
    this.options.consoleLevel = level;
    for (const transport of this.values()) {
      if (transport instanceof ConsoleTransport) {
        transport.level = level;
      }
    }
  }

  get defaults() {
    return {
      file: null,
      encoding: 'utf8',
      level: 'INFO',
      consoleLevel: 'NONE',
      formatter: utils.defaultFormatter,
      buffer: true,
      outputJSON: false,
      jsonFile: '',
    };
  }
}

module.exports = EggLogger;
