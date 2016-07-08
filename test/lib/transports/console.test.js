'use strict';

const path = require('path');
const rimraf = require('rimraf');
const coffee = require('coffee');
const mm = require('mm');
const levels = require('../../../index');

describe('test/transports/console.test.js', () => {
  const logger = path.join(__dirname, '../../fixtures/console_transport.js');
  const tmp = path.join(__dirname, '../fixtures/tmp');

  afterEach(() => {
    rimraf.sync(tmp);
    mm.restore();
  });

  it('should use EGG_LOG env for log level first', done => {
    mm(process.env, 'EGG_LOG', 'error');
    const options = {
      file: path.join(tmp, 'a.log'),
      level: 'WARN',
    };
    coffee.fork(logger, [ JSON.stringify(options) ])
    .notExpect('stdout', /warn foo\n/)
    .notExpect('stdout', /error foo\n/)
    .expect('stderr', 'error foo\n')
    .end(done);
  });

  it('should print warn log to stderr', done => {
    const options = {
      file: path.join(tmp, 'a.log'),
      level: 'WARN',
      stderrLevel: 'WARN',
    };
    coffee.fork(logger, [ JSON.stringify(options) ])
    .expect('stdout', 'write foo\n')
    .expect('stderr', 'warn foo\nerror foo\n')
    .end(done);
  });

  it('should not print log to stderr when stderrLevel = NONE', done => {
    const options = {
      file: path.join(tmp, 'a.log'),
      level: 'WARN',
      stderrLevel: 'NONE',
    };
    coffee.fork(logger, [ JSON.stringify(options) ])
    .notExpect('stderr', /write foo/)
    .end(done);
  });

  it('should set level to levels.ERROR const', done => {
    const options = {
      file: path.join(tmp, 'a.log'),
      level: levels.ERROR,
    };
    coffee.fork(logger, [ JSON.stringify(options) ])
    .expect('stdout', 'write foo\n')
    .expect('stderr', 'error foo\n')
    .end(done);
  });

  it('console level should be NONE', done => {
    const options = {
      file: path.join(tmp, 'a.log'),
      flushInterval: 10,
    };
    coffee.fork(logger, [ JSON.stringify(options) ])
    .expect('stdout', '')
    .expect('stderr', '')
    .end(done);
  });

  it('should print all log when level = debug', done => {
    const options = {
      file: path.join(tmp, 'a.log'),
      level: 'debug',
      flushInterval: 10,
    };
    coffee.fork(logger, [ JSON.stringify(options) ])
    .expect('stdout', /debug foo\n/)
    .expect('stdout', /info foo\n/)
    .expect('stdout', /warn foo\n/)
    .notExpect('stdout', /error foo\n/)
    .expect('stderr', 'error foo\n')
    .end(done);
  });

  it('should print info log when level = info', done => {
    const options = {
      file: path.join(tmp, 'a.log'),
      level: 'info',
      flushInterval: 10,
    };
    coffee.fork(logger, [ JSON.stringify(options) ])
    .notExpect('stdout', /debug foo\n/)
    .expect('stdout', /info foo\n/)
    .expect('stdout', /warn foo\n/)
    .notExpect('stdout', /error foo\n/)
    .expect('stderr', 'error foo\n')
    .end(done);
  });

  it('should print warn log when level = warn', done => {
    const options = {
      file: path.join(tmp, 'a.log'),
      level: 'warn',
      flushInterval: 10,
    };
    coffee.fork(logger, [ JSON.stringify(options) ])
    .notExpect('stdout', /debug foo\n/)
    .notExpect('stdout', /info foo\n/)
    .expect('stdout', /warn foo\n/)
    .notExpect('stdout', /error foo\n/)
    .expect('stderr', 'error foo\n')
    .end(done);
  });

  it('should print error log when level = error', done => {
    const options = {
      file: path.join(tmp, 'a.log'),
      level: 'error',
      flushInterval: 10,
    };
    coffee.fork(logger, [ JSON.stringify(options) ])
    .expect('stdout', 'write foo\n')
    .expect('stderr', 'error foo\n')
    .end(done);
  });

  it('should not print any log to stdout/stderr when level = NONE', done => {
    const options = {
      file: path.join(tmp, 'a.log'),
      level: 'NONE',
      flushInterval: 10,
    };
    coffee.fork(logger, [ JSON.stringify(options) ])
    .expect('stdout', '')
    .expect('stderr', '')
    .end(done);
  });

  it('should treat none to NONE', done => {
    const options = {
      file: path.join(tmp, 'a.log'),
      level: 'none',
      flushInterval: 10,
    };
    coffee.fork(logger, [ JSON.stringify(options) ])
    .expect('stdout', '')
    .expect('stderr', '')
    .end(done);
  });

});
