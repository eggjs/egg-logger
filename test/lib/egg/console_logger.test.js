'use strict';

const path = require('path');
const coffee = require('coffee');
const mm = require('mm');
const { rimraf } = require('../../utils');

describe('test/egg/console_logger.test.js', () => {
  const consoleLoggerFile = path.join(__dirname, '../../fixtures/egg_console_logger.js');
  const tmp = path.join(__dirname, '../../fixtures/tmp');

  afterEach(async () => {
    await rimraf(tmp);
  });
  afterEach(mm.restore);

  it('should info by default on NODE_ENV = production', done => {
    mm(process.env, 'NODE_ENV', 'production');
    coffee.fork(consoleLoggerFile)
      .notExpect('stdout', /DEBUG \d+ debug foo/)
      .expect('stdout', /INFO \d+ info foo/)
      .expect('stdout', /WARN \d+ warn foo/)
      .expect('stderr', /ERROR \d+ error foo/)
      .end(done);
  });

  it('should warn by default on NODE_ENV not exists', done => {
    mm(process.env, 'NODE_ENV', '');
    coffee.fork(consoleLoggerFile)
      .notExpect('stdout', /DEBUG \d+ debug foo/)
      .notExpect('stdout', /INFO \d+ info foo/)
      .expect('stdout', /WARN \d+ warn foo/)
      .expect('stderr', /ERROR \d+ error foo/)
      .end(done);
  });

  it('should warn by default on NODE_ENV is test', done => {
    mm(process.env, 'NODE_ENV', 'test');
    coffee.fork(consoleLoggerFile)
      .notExpect('stdout', /DEBUG \d+ debug foo/)
      .notExpect('stdout', /INFO \d+ info foo/)
      .expect('stdout', /WARN \d+ warn foo/)
      .expect('stderr', /ERROR \d+ error foo/)
      .end(done);
  });

  it('can set level on NODE_ENV = production', done => {
    mm(process.env, 'NODE_ENV', 'production');
    const options = {
      level: 'ERROR',
    };

    coffee.fork(consoleLoggerFile, [ JSON.stringify(options) ])
      .notExpect('stdout', /INFO \d+ info foo/)
      .notExpect('stdout', /WARN \d+ warn foo/)
      .expect('stderr', /ERROR \d+ error foo/)
      .end(done);
  });

  it('should show console log', done => {
    coffee.fork(consoleLoggerFile)
      .expect('stderr', /[\d -,:]+ ERROR \d+ error foo/)
      .end(done);
  });

  it('should info by env on NODE_CONSOLE_LOGGRE_LEVEL = INFO', done => {
    mm(process.env, 'NODE_CONSOLE_LOGGRE_LEVEL', 'INFO');
    coffee.fork(consoleLoggerFile)
      .notExpect('stdout', /DEBUG \d+ debug foo/)
      .expect('stdout', /INFO \d+ info foo/)
      .expect('stdout', /WARN \d+ warn foo/)
      .expect('stderr', /ERROR \d+ error foo/)
      .end(done);
  });

  it('should info by env on NODE_CONSOLE_LOGGRE_LEVEL = WARN', done => {
    mm(process.env, 'NODE_CONSOLE_LOGGRE_LEVEL', 'WARN');
    coffee.fork(consoleLoggerFile)
      .notExpect('stdout', /DEBUG \d+ debug foo/)
      .notExpect('stdout', /INFO \d+ info foo/)
      .expect('stdout', /WARN \d+ warn foo/)
      .expect('stderr', /ERROR \d+ error foo/)
      .end(done);
  });

  it('should info by env on NODE_CONSOLE_LOGGRE_LEVEL = ERROR', done => {
    mm(process.env, 'NODE_CONSOLE_LOGGRE_LEVEL', 'ERROR');
    coffee.fork(consoleLoggerFile)
      .notExpect('stdout', /DEBUG \d+ debug foo/)
      .notExpect('stdout', /INFO \d+ info foo/)
      .notExpect('stdout', /WARN \d+ warn foo/)
      .expect('stderr', /ERROR \d+ error foo/)
      .end(done);
  });

});
