'use strict';

const Logger = require('../../index').Logger;
const ConsoleTransport = require('../../index').ConsoleTransport;
const options = JSON.parse(process.argv[2]);
const logger = new Logger();
logger.set('console', new ConsoleTransport(options));
logger.debug('debug foo');
logger.info('info foo');
logger.warn('warn foo');
logger.error('error foo');
logger.write('write foo');
process.exit(0);
