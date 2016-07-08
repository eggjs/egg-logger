'use strict';

const path = require('path');
const Logger = require('../').EggLogger;

const logger = new Logger({
  file: path.join(__dirname, '../.logs/running.log'),
  level: 'DEBUG',
});

const logger2 = new Logger({
  file: path.join(__dirname, '../.logs/running.log'),
  level: 'DEBUG',
});

let index = 0;
setInterval(() => {
  if (index >= 10000) {
    logger.reload();
    index = 0;
  }
  logger.info('logger1: long running test, index: %d, 还有中文会显示乱码但是它不是乱码, 是你的终端显示不了', index++);
  logger2.info('logger2: long running test, index: %d, 还有中文会显示乱码但是它不是乱码, 是你的终端显示不了', index++);
}, 50);

process.on('SIGUSR1', function() {
  console.log('Got SIGUSR1, reload');
  logger.reload();
  logger2.reload();
});
