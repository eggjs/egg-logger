'use strict';

const Logger = require('../../index').EggConsoleLogger;
const options = process.argv[2] ? JSON.parse(process.argv[2]) : {};
const logger = new Logger(options);
logger.debug('debug foo');
logger.info('info foo');
logger.warn('warn foo');
logger.error('error foo');
