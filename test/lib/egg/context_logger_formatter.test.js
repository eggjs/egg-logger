'use strict';

const fs = require('fs');
const path = require('path');
const should = require('should');
const rimraf = require('rimraf');
const koa = require('koa');
const request = require('supertest');
const mm = require('mm');

const Logger = require('../../../index').EggLogger;
const ContextLogger = require('../../../index').EggContextLogger;

describe('test/lib/egg/context_logger_formatter.test.js', () => {
  const filepath = path.join(__dirname, '../../fixtures/tmp/a.log');
  let app;

  before(() => {
    app = koa();

    app.use(function*() {
      this.clogger = new ContextLogger(this, this.app.logger);

      yield new Promise(resolve => setTimeout(resolve, 10));
      this.clogger.info('info foo');

      yield new Promise(resolve => setTimeout(resolve, 10));
      this.clogger.warn('warn foo');

      yield new Promise(resolve => setTimeout(resolve, 10));
      this.clogger.write('[foo] hi raw log here');

      yield new Promise(resolve => setTimeout(resolve, 10));
      this.body = 'done';
    });
    app.logger = new Logger({
      file: filepath,
      level: 'INFO',
      consoleLevel: 'NONE',
      flushInterval: 10,
      contextFormatter(meta) {
        return '[Custom] ' + meta.level + ' ' + meta.ctx.url + ' ' + meta.message;
      },
    });
    app.on('error', err => console.log(err));
    Object.defineProperty(app.request, 'ip', {
      value: '127.0.0.1',
    });
  });
  afterEach(() => {
    rimraf.sync(path.dirname(filepath));
    mm.restore();
    app.logger.reload();
  });

  it('should custom context formatter', done => {
    request(app.callback())
      .get('/test_custom_formatter')
      .expect('done', err => {
        should.not.exists(err);
        fs.readFileSync(filepath, 'utf8')
        // eslint-disable-next-line no-useless-escape
          .should.match(/\[Custom\] INFO \/test_custom_formatter info foo\n/);
        done();
      });
  });
});
