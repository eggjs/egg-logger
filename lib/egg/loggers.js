'use strict';

const assert = require('assert');
const debug = require('util').debuglog('egg:logger');
const utils = require('../utils');
const Logger = require('./logger');
const ErrorLogger = require('./error_logger');
const CustomLogger = require('./custom_logger');

const defaults = {
  env: 'default',
  type: '',
  dir: '',
  encoding: 'utf8',
  level: 'INFO',
  consoleLevel: 'NONE',
  outputJSON: false,
  outputJSONOnly: false,
  buffer: true,
  appLogName: '',
  coreLogName: '',
  agentLogName: '',
  errorLogName: '',
  concentrateError: 'duplicate',
  concentrateErrorLoggerName: 'errorLogger',
};

/**
 * Logger Manager, accord config to create multi loggers.
 */

class Loggers extends Map {

  /**
   * @class
   * @param  {Object} config - egg app config
   * - logger
   *   - {String} env - egg app runtime env string, detail please see `app.config.env`
   *   - {String} type - current process type, `application` or `agent`
   *   - {String} dir - log file dir
   *   - {String} [encoding = utf8] - log string encoding
   *   - {String} [level = INFO] - file log level
   *   - {String} [consoleLevel = NONE] - console log level
   *   - {Boolean} [outputJSON = false] - send JSON log or not
   *   - {Boolean} [outputJSONOnly = false] - only send JSON log
   *   - {Boolean} [buffer = true] - use {@link FileBufferTransport} or not
   *   - {String} appLogName - egg app file logger name
   *   - {String} coreLogName - egg core file logger name
   *   - {String} agentLogName - egg agent file logger name
   *   - {String} errorLogName - err common error logger name
   *   - {String} eol - end of line char
   *   - {String} [concentrateError = duplicate] - whether write error logger to `concentrateErrorLoggerName` logger, `duplicate` / `redirect` / `ignore`
   *   - {String} [concentrateErrorLoggerName = errorLogger] - concentrate logger name
   *   - {AsyncLocalStorage} [localStorage] - AsyncLocalStorage instance to get current ctx
   * - customLogger
   */
  constructor(config) {
    super();

    const loggerConfig = utils.assign({}, defaults, config.logger);
    const customLoggerConfig = config.customLogger;

    debug('Init loggers with options %j', loggerConfig);
    assert(loggerConfig.type, 'should pass config.logger.type');
    assert(loggerConfig.dir, 'should pass config.logger.dir');
    assert(loggerConfig.appLogName, 'should pass config.logger.appLogName');
    assert(loggerConfig.coreLogName, 'should pass config.logger.coreLogName');
    assert(loggerConfig.agentLogName, 'should pass config.logger.agentLogName');
    assert(loggerConfig.errorLogName, 'should pass config.logger.errorLogName');

    const errorLogger = new ErrorLogger(utils.assign({}, loggerConfig, {
      file: loggerConfig.errorLogName,
    }));
    this.set('errorLogger', errorLogger);

    let coreLogger;
    let logger;
    if (loggerConfig.type === 'agent') {
      logger = new Logger(utils.assign({}, loggerConfig, {
        file: loggerConfig.agentLogName,
      }));

      coreLogger = new Logger(utils.assign({}, loggerConfig, loggerConfig.coreLogger, {
        file: loggerConfig.agentLogName,
      }));
    } else {
      logger = new Logger(utils.assign({}, loggerConfig, {
        file: loggerConfig.appLogName,
      }));

      coreLogger = new Logger(utils.assign({}, loggerConfig, loggerConfig.coreLogger, {
        file: loggerConfig.coreLogName,
      }));
    }
    this.set('logger', logger);
    this.set('coreLogger', coreLogger);

    for (const name in customLoggerConfig) {
      const logger = new CustomLogger(utils.assign({}, loggerConfig, customLoggerConfig[name]));
      this.set(name, logger);
    }

    // setConcentrateError at the end
    this.setConcentrateError('logger', logger);
    this.setConcentrateError('coreLogger', coreLogger);
    for (const name in customLoggerConfig) {
      this.setConcentrateError(name, this.get(name));
    }
  }

  /**
   * Disable console logger
   */
  disableConsole() {
    for (const logger of this.values()) {
      logger.disable('console');
    }
  }

  reload() {
    for (const logger of this.values()) {
      logger.reload();
    }
  }

  /**
   * Add a logger
   * @param {String} name - logger name
   * @param {Logger} logger - Logger instance
   */
  set(name, logger) {
    if (this.has(name)) {
      return;
    }

    this[name] = logger;
    super.set(name, logger);
  }

  setConcentrateError(name, logger) {
    // redirect ERROR log to errorLogger, except errorLogger itself
    if (name !== 'errorLogger') {
      const concentrateLogger = this.get(logger.options.concentrateErrorLoggerName);
      if (!concentrateLogger) return;

      switch (logger.options.concentrateError) {
        case 'duplicate':
          logger.duplicate('error', concentrateLogger, { excludes: [ 'console' ] });
          break;
        case 'redirect':
          logger.redirect('error', concentrateLogger);
          break;
        case 'ignore':
          break;
        default:
          break;
      }
    }
  }

}

module.exports = Loggers;
