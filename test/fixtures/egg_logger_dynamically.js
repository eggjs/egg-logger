'use strict';

const Logger = require('../../index').EggLogger;
const options = JSON.parse(process.argv[2]);
options.buffer = false;
options.level = 'INFO';
options.consoleLevel = 'INFO';

const logger = new Logger(options);
logger.info('info foo');
logger.warn('warn foo');

logger.level = 'WARN';
logger.info('info foo after level changed');
logger.warn('warn foo after level changed');
logger.warn('logger level', logger.level);

logger.consoleLevel = 'WARN';
logger.info('info foo after consoleLevel changed');
logger.warn('warn foo after consoleLevel changed');
logger.warn('logger consoleLevel', logger.consoleLevel);
