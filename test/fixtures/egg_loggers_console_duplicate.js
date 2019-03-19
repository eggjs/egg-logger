'use strict';

const path = require('path');
const Loggers = require('../../index').EggLoggers;
const tmp = path.join(__dirname, 'tmp');
const loggers = new Loggers({
  logger: {
    type: 'application',
    consoleLevel: 'INFO',
    dir: tmp,
    appLogName: 'app-web.log',
    coreLogName: 'egg-web.log',
    agentLogName: 'egg-agent.log',
    errorLogName: 'common-error.log',
    buffer: false,
  },
  customLogger: {
    aLogger: {
      consoleLevel: 'INFO',
      file: 'console_duplicate.log',
    },
  },
});
loggers.logger.error('built-in error');
loggers.aLogger.info('custom info');
loggers.aLogger.error('custom error');
