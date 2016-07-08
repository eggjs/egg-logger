'use strict';

const path = require('path');
const Logger = require('../../index').Logger;
const logger = new Logger({
  file: path.join(__dirname, 'tmp/a.log'),
  level: 'NONE',
  stdoutLevel: 'error',
  errorToStderr: true,
});
logger.error('log after instant');
logger.errorToStderr = false;
logger.error('log after disable errorToStderr');
logger.errorToStderr = true;
logger.error('log after enable errorToStderr');
process.exit(0);
