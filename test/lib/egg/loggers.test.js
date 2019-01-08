'use strict';

const should = require('should');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { sleep, rimraf } = require('mz-modules');
const coffee = require('coffee');
const Loggers = require('../../../index').EggLoggers;

describe('test/egg/loggers.test.js', () => {
  const tmp = path.join(__dirname, '../../fixtures/tmp');
  const aLog = path.join(tmp, 'a.log');
  const bLog = path.join(tmp, 'b.log');
  const cLog = path.join(tmp, 'c.log');
  const dLog = path.join(tmp, 'd.log');
  const eLog = path.join(tmp, 'e.log');
  const fLog = 'f.log';

  before(() => rimraf(tmp));
  after(() => rimraf(tmp));

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
            file: aLog,
          },
          bLogger: {
            file: bLog,
          },
          cLogger: {
            file: cLog,
            eol: '',
          },
          dLogger: {
            file: dLog,
            concentrateError: 'redirect',
          },
          eLogger: {
            file: eLog,
            concentrateError: 'ignore',
          },
          fLogger: {
            file: fLog,
          },
        },
      });
    });

    it('loggers can create multi logger instance', () => {
      should.exists(loggers.logger);
      should.exists(loggers.coreLogger);
      should.exists(loggers.errorLogger);
      should.exists(loggers.aLogger);
      should.exists(loggers.bLogger);
    });

    it('all logger.error will duplicate to errorLogger', function* () {
      loggers.logger.error('this is logger error foo1');
      loggers.coreLogger.error('this is coreLogger error foo1');
      loggers.aLogger.error('this is aLogger error foo1');
      loggers.bLogger.error('this is bLogger error foo1');
      loggers.dLogger.error('this is dLogger error foo1');
      loggers.eLogger.error('this is eLogger error foo1');

      loggers.aLogger.info('this is aLogger info foo1');
      loggers.dLogger.info('this is dLogger info foo1');

      yield sleep(10);

      const content = fs.readFileSync(path.join(tmp, 'common-error.log'), 'utf8');
      assert(content.includes('this is logger error foo1'));
      assert(content.includes('this is coreLogger error foo1'));
      assert(content.includes('this is aLogger error foo1'));
      assert(content.includes('this is bLogger error foo1'));

      // should not duplicate info
      assert(!content.includes('this is aLogger info foo1'));
      assert(fs.readFileSync(aLog, 'utf-8').includes('this is aLogger info foo1'));

      // should duplicate
      assert(fs.readFileSync(path.join(tmp, 'app-web.log'), 'utf-8').includes('this is logger error foo1'));
      assert(fs.readFileSync(path.join(tmp, 'egg-web.log'), 'utf-8').includes('this is coreLogger error foo1'));
      assert(fs.readFileSync(aLog, 'utf-8').includes('this is aLogger error foo1'));
      assert(fs.readFileSync(bLog, 'utf-8').includes('this is bLogger error foo1'));

      // should redirect
      assert(content.includes('this is dLogger error foo1'));
      assert(!content.includes('this is dLogger info foo1'));
      assert(fs.readFileSync(dLog, 'utf-8').includes('this is dLogger info foo1'));

      // should only write to self
      assert(!content.includes('this is eLogger error foo1'));
      assert(fs.readFileSync(eLog, 'utf-8').includes('this is eLogger error foo1'));

      assert(loggers.cLogger.options.concentrateError === 'duplicate');
      assert(loggers.dLogger.options.concentrateError === 'redirect');
      assert(loggers.eLogger.options.concentrateError === 'ignore');
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

    it('should fLogger log to f.log with relative config', function*() {
      loggers.fLogger.info('fLogger info foo');

      yield sleep(10);

      const content = fs.readFileSync(path.join(tmp, 'f.log'), 'utf8');
      content.should.containEql('fLogger info foo');
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

    it('should not duplicate to console', done => {
      const loggerFile = path.join(__dirname, '../../fixtures/egg_loggers_console_duplicate.js');
      coffee.fork(loggerFile)
        // .debug()
        .end((err, res) => {
          if (err) return done(err);
          assert(res.stderr.match(/built-in error/g).length === 1);
          assert(res.stderr.match(/custom error/g).length === 1);
          assert(!res.stderr.match(/custom info/));
          done();
        });
    });
  });
});
