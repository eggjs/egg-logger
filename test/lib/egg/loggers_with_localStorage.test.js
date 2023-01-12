const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { AsyncLocalStorage } = require('async_hooks');
const Loggers = require('../../..').EggLoggers;
const { sleep, rimraf } = require('../../utils');

describe('test/lib/egg/loggers_with_localStorage.test.js', () => {
  const localStorage = new AsyncLocalStorage();
  const tmp = path.join(__dirname, '../../fixtures/tmp_egg_loggers_with_localStorage');
  const aLog = path.join(tmp, 'a.log');

  before(() => rimraf(tmp));
  after(() => rimraf(tmp));

  beforeEach(() => {
    localStorage.enterWith({
      tracer: {
        traceId: `trace-${Date.now()}`,
      },
      method: 'GET',
      url: '/foo',
      ip: '127.0.0.1',
    });
  });
  afterEach(() => {
    localStorage.disable();
  });

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
          localStorage,
        },
        customLogger: {
          aLogger: {
            file: aLog,
          },
        },
      });
    });

    it('should app.logger log to appLogName', async () => {
      loggers.logger.info('logger info foo');
      await sleep(10);
      const content = fs.readFileSync(path.join(tmp, 'app-web.log'), 'utf8');
      assert.match(content, / INFO \d+ \[-\/127.0.0.1\/trace-\d+\/\d+ms GET \/foo] logger info foo/);
    });

    it('should app.coreLogger warn log to coreLogName', async () => {
      loggers.coreLogger.warn('coreLogger warn foo');
      await sleep(10);
      const content = fs.readFileSync(path.join(tmp, 'egg-web.log'), 'utf8');
      assert.match(content, / WARN \d+ \[-\/127.0.0.1\/trace-\d+\/\d+ms GET \/foo] coreLogger warn foo/);
    });

    it('should aLogger log to a.log', async () => {
      loggers.aLogger.info('aLogger info foo');
      await sleep(10);
      const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
      assert.match(content, / INFO \d+ \[-\/127.0.0.1\/trace-\d+\/\d+ms GET \/foo] aLogger info foo/);
    });
  });

  describe('support options.contextFormatter', () => {
    let loggers;
    before(async () => {
      await rimraf(tmp);
      loggers = new Loggers({
        logger: {
          type: 'application',
          dir: tmp,
          appLogName: 'app-web.log',
          coreLogName: 'egg-web.log',
          agentLogName: 'egg-agent.log',
          errorLogName: 'common-error.log',
          buffer: false,
          localStorage,
          contextFormatter(meta) {
            return `${meta.level} ${meta.paddingMessage} ${meta.message}`;
          },
        },
      });
    });

    it('should contains paddingMessage', async () => {
      loggers.logger.info('logger info foo with paddingMessage');
      await sleep(10);
      const content = fs.readFileSync(path.join(tmp, 'app-web.log'), 'utf8');
      assert.match(content, /INFO \[-\/127.0.0.1\/trace-\d+\/\d+ms GET \/foo] logger info foo with paddingMessage/);
    });
  });

  describe('support options.contextFormatter + options.paddingMessageFormatter', () => {
    let loggers;
    before(async () => {
      await rimraf(tmp);
      loggers = new Loggers({
        logger: {
          type: 'application',
          dir: tmp,
          appLogName: 'app-web.log',
          coreLogName: 'egg-web.log',
          agentLogName: 'egg-agent.log',
          errorLogName: 'common-error.log',
          buffer: false,
          localStorage,
          paddingMessageFormatter(ctx) {
            return `[${ctx.tracer.traceId}]`;
          },
          contextFormatter(meta) {
            return `${meta.level} ${meta.paddingMessage} ${meta.message}`;
          },
        },
      });
    });

    it('should contains paddingMessage', async () => {
      loggers.logger.info('logger info foo with custom paddingMessage');
      await sleep(10);
      const content = fs.readFileSync(path.join(tmp, 'app-web.log'), 'utf8');
      assert.match(content, /INFO \[trace-\d+] logger info foo with custom paddingMessage/);
    });
  });

  describe('support options.paddingMessageFormatter', () => {
    let loggers;
    before(async () => {
      await rimraf(tmp);
      loggers = new Loggers({
        logger: {
          type: 'application',
          dir: tmp,
          appLogName: 'app-web.log',
          coreLogName: 'egg-web.log',
          agentLogName: 'egg-agent.log',
          errorLogName: 'common-error.log',
          buffer: false,
          localStorage,
          paddingMessageFormatter(ctx) {
            return `[${ctx.tracer.traceId}]`;
          },
        },
      });
    });

    it('should contains paddingMessage', async () => {
      loggers.logger.info('logger info foo with custom paddingMessage');
      await sleep(10);
      const content = fs.readFileSync(path.join(tmp, 'app-web.log'), 'utf8');
      assert.match(content, / INFO \d+ \[trace-\d+] logger info foo with custom paddingMessage/);
    });
  });
});
