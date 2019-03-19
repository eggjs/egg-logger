'use strict';

const fs = require('fs');
const path = require('path');
const should = require('should');
const rimraf = require('rimraf');
const koa = require('koa');
const request = require('supertest');
const mm = require('mm');
const assert = require('assert');

const Logger = require('../../../index').EggLogger;
const ContextLogger = require('../../../index').EggContextLogger;

describe('test/lib/egg/context_logger.test.js', () => {
  const filepath = path.join(__dirname, '../../fixtures/tmp/a.log');
  const filepathc = path.join(__dirname, '../../fixtures/tmp/b.log');
  const filepathcc = path.join(__dirname, '../../fixtures/tmp/c.log');
  let app;

  before(() => {
    app = koa();
    app.use(function*(next) {
      if (this.path === '/starttime') {
        this.starttime = Date.now();
      }
      this.logger = new ContextLogger(this, this.app.logger);
      this.cLogger = new ContextLogger(this, this.app.cLogger);
      this.ccLogger = new ContextLogger(this, this.app.ccLogger);
      yield next;
    });
    app.use(function*() {
      yield new Promise(resolve => setTimeout(resolve, 10));
      this.logger.info('info foo');

      yield new Promise(resolve => setTimeout(resolve, 10));
      this.logger.warn('warn foo');

      yield new Promise(resolve => setTimeout(resolve, 10));
      this.logger.write('[foo] hi raw log here');

      yield new Promise(resolve => setTimeout(resolve, 10));
      this.cLogger.info('ctx');

      yield new Promise(resolve => setTimeout(resolve, 10));
      this.ccLogger.info('ctx');

      yield new Promise(resolve => setTimeout(resolve, 10));
      this.body = 'done';
    });
    app.logger = new Logger({
      file: filepath,
      level: 'INFO',
      consoleLevel: 'NONE',
      flushInterval: 10,
    });
    app.cLogger = new Logger({
      file: filepathc,
      level: 'INFO',
      consoleLevel: 'INFO',
      flushInterval: 1,
      contextFormatter: meta => `message=${meta.message}&level=${meta.level}&path=${meta.ctx.path}`,
    });
    app.ccLogger = new Logger({
      file: filepathcc,
      level: 'INFO',
      consoleLevel: 'INFO',
      flushInterval: 1,
      contextFormatter: meta => JSON.stringify(meta),
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
    app.cLogger.reload();
    app.ccLogger.reload();
  });

  it('should write ctx log to log file', done => {
    request(app.callback())
      .get('/')
      .expect('done', err => {
        should.not.exists(err);
        fs.readFileSync(filepath, 'utf8')
        // eslint-disable-next-line no-useless-escape
          .should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} INFO \d+ \[-\/127.0.0.1\/-\/0ms GET \/\] info foo\n/);
        done();
      });
  });

  it('should contains userId/logonId/traceId on ctx log', done => {
    mm(app.context, 'userId', '123123');
    mm(app.context, 'tracer', {
      traceId: 'aabbccdd',
    });
    request(app.callback())
      .get('/')
      .expect('done', err => {
        should.not.exists(err);
        fs.readFileSync(filepath, 'utf8')
        // eslint-disable-next-line no-useless-escape
          .should.match(/123123\/127.0.0.1\/aabbccdd\/0ms GET \/\] info foo\n/);
        done();
      });
  });

  it('should auto log request spent time', done => {
    request(app.callback())
      .get('/starttime')
      .expect('done', err => {
        should.not.exists(err);
        fs.readFileSync(filepath, 'utf8')
        // eslint-disable-next-line no-useless-escape
          .should.match(/\[-\/127.0.0.1\/-\/\d*ms GET \/starttime\] info foo\n/);
        done();
      });
  });

  it('can log multi ctx log', done => {
    request(app.callback())
      .get('/starttime')
      .expect('done', err => {
        should.not.exists(err);
        const body = fs.readFileSync(filepath, 'utf8');
        const m = body.match(/\/\d*ms/g);
        (parseInt(m[1].substring(1)) > parseInt(m[0].substring(1))).should.equal(true);
        done();
      });
  });

  it('should pipe write to raw logger', done => {
    request(app.callback())
      .get('/starttime')
      .expect('done', err => {
        should.not.exists(err);
        // eslint-disable-next-line no-useless-escape
        fs.readFileSync(filepath, 'utf8').should.match(/\n\[foo\] hi raw log here\n/);
        done();
      });
  });

  it('should format context logger', done => {
    request(app.callback())
      .get('/')
      .expect('done', err => {
        should.not.exists(err);
        const content = fs.readFileSync(filepathc, 'utf8');
        assert(content.includes('message=ctx&level=INFO&path=/\n'));
        done();
      });
  });

  it('should format context logger', done => {
    request(app.callback())
      .get('/')
      .expect('done', err => {
        should.not.exists(err);
        const content = fs.readFileSync(filepathcc, 'utf8');
        assert(content.includes('"message":"ctx"'));
        assert(!content.includes('"ctx":'));
        done();
      });
  });
});
