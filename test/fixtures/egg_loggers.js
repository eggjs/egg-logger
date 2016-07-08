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
});
loggers.logger.info('info foo');
loggers.disableConsole();
loggers.logger.info('info foo after disable');
