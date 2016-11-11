'use strict';

const should = require('should');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const sleep = require('ko-sleep');
const coffee = require('coffee');
const Loggers = require('../../../index').EggLoggers;

describe('test/egg/loggers.test.js', () => {
  const tmp = path.join(__dirname, '../../fixtures/tmp');

  describe('application', () => {
    let loggers;
    before(() => {
      loggers = new Loggers({
        logger: {
          type: 'application',
          dir: tmp,
          appLogName: 'app-web.log',
          coreLogName: 'egg-web.log',
          agentLogName: 'egg-agent.log',
          errorLogName: 'common-error.log',
          buffer: false,
          coreLogger: {
            level: 'WARN',
            consoleLevel: 'WARN',
          },
        },
        customLogger: {
          aLogger: {
            file: path.join(tmp, 'a.log'),
          },
          bLogger: {
            file: path.join(tmp, 'b.log'),
          },
          cLogger: {
            file: path.join(tmp, 'c.log'),
            eol: '',
          },
        },
      });
    });
    after(() => {
      rimraf.sync(tmp);
    });

    it('loggers can create multi logger instance', () => {
      should.exists(loggers.logger);
      should.exists(loggers.coreLogger);
      should.exists(loggers.errorLogger);
      should.exists(loggers.aLogger);
      should.exists(loggers.bLogger);
    });

    it('all logger.error will redirect to errorLogger', function*() {
      loggers.logger.error('logger error foo1');
      loggers.coreLogger.error('coreLogger error foo1');
      loggers.aLogger.error('aLogger error foo1');
      loggers.bLogger.error('bLogger error foo1');

      yield sleep(10);

      const content = fs.readFileSync(path.join(tmp, 'common-error.log'), 'utf8');
      content.should.containEql('logger error foo1');
      content.should.containEql('coreLogger error foo1');
      content.should.containEql('aLogger error foo1');
      content.should.containEql('bLogger error foo1');
    });

    it('should app.logger log to appLogName', function*() {
      loggers.logger.info('logger info foo');

      yield sleep(10);

      const content = fs.readFileSync(path.join(tmp, 'app-web.log'), 'utf8');
      content.should.containEql('logger info foo');
    });

    it('should app.coreLogger warn log to coreLogName', function*() {
      loggers.coreLogger.warn('coreLogger warn foo');

      yield sleep(10);

      const content = fs.readFileSync(path.join(tmp, 'egg-web.log'), 'utf8');
      content.should.containEql('coreLogger warn foo');
    });

    it('should support coreLogger level=WARN', function*() {
      loggers.coreLogger.info('coreLogger info foo');

      yield sleep(10);

      const content = fs.readFileSync(path.join(tmp, 'egg-web.log'), 'utf8');
      content.should.not.containEql('coreLogger info foo');
    });

    it('should aLogger log to a.log', function*() {
      loggers.aLogger.info('aLogger info foo');

      yield sleep(10);

      const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
      content.should.containEql('aLogger info foo');
    });

    it('should bLogger log to b.log', function*() {
      loggers.bLogger.info('bLogger info foo');

      yield sleep(10);

      const content = fs.readFileSync(path.join(tmp, 'b.log'), 'utf8');
      content.should.containEql('bLogger info foo');
    });

    it('cLogger dont contains eol', function*() {
      loggers.cLogger.info('cLogger info foo');
      loggers.cLogger.info('cLogger info bar');

      yield sleep(10);

      const content = fs.readFileSync(path.join(tmp, 'c.log'), 'utf8');
      content.should.not.containEql('\n');
    });

    it('reload all logger', done => {
      loggers.reload();
      setTimeout(done, 500);
    });
  });

  describe('agent', () => {
    let loggers;
    before(() => {
      loggers = new Loggers({
        logger: {
          type: 'agent',
          dir: tmp,
          appLogName: 'app-web.log',
          coreLogName: 'egg-web.log',
          agentLogName: 'egg-agent.log',
          errorLogName: 'common-error.log',
          buffer: false,
          eol: '\r',
          coreLogger: {
            level: 'WARN',
            consoleLevel: 'WARN',
          },
        },
      });
    });
    after(() => {
      rimraf.sync(tmp);
    });

    it('loggers.logger alias to loggers.coreLogger', () => {
      loggers.logger.options.file.should.equal(loggers.coreLogger.options.file);
    });

    it('should agent.coreLogger log to agentLogName', function*() {
      loggers.logger.info('logger info foo');

      yield sleep(10);

      const content = fs.readFileSync(path.join(tmp, 'egg-agent.log'), 'utf8');
      content.should.containEql('logger info foo');
      content.should.match(/foo\r$/);
    });

    it('should support coreLogger level=WARN', function*() {
      loggers.coreLogger.info('coreLogger info foo');
      yield sleep(10);
      const content = fs.readFileSync(path.join(tmp, 'egg-agent.log'), 'utf8');
      content.should.not.containEql('coreLogger info foo');
    });
  });

  describe('console', () => {
    it('should disable console log', done => {
      const loggerFile = path.join(__dirname, '../../fixtures/egg_loggers.js');
      coffee.fork(loggerFile)
      .expect('stdout', /info foo/)
      .notExpect('stdout', /info foo after disable/)
      .end(done);
    });
  });
});
