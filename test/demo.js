'use strict';

const path = require('path');
const Logger = require('../').EggLogger;

const webLogger = new Logger({
  file: path.join(__dirname, '../.logs/demo-web.log'),
  level: 'INFO',
  consoleLevel: 'WARN',
  // encoding: 'gbk',
});

webLogger.info('controllers/home.js 测试 loggger 输出');
webLogger.warn('controllers/home.js 测试 loggger 输出, 你应该看到 warn: %s', Date());

const errorLogger = new Logger({
  file: path.join(__dirname, '../.logs/common-error.log'),
  level: 'ERROR',
  consoleLevel: 'ERROR',
  // encoding: 'gbk',
});

errorLogger.error(new Error('mock error 中文'));

setTimeout(function() {
  webLogger.end();
  errorLogger.end();
}, 1500);
