'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const rimraf = require('rimraf');
const sleep = require('ko-sleep');
const mm = require('mm');
const chalk = require('chalk');
const FileTransport = require('../../index').FileTransport;
const Logger = require('../../index').Logger;
const levels = require('../../index');
const utils = require('../../lib/utils');

describe('test/lib/formatter.test.js', () => {
  const tmp = path.join(__dirname, '../fixtures/tmp');
  const filepath = path.join(tmp, 'a.log');

  let transport;
  before(() => {
    transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
    });
  });

  afterEach(() => {
    mm.restore();
    rimraf.sync(path.dirname(filepath));
    transport.reload();
  });

  it('should use util.format handle arguments', function*() {
    const logger = new Logger();
    logger.set('file', transport);
    logger.info('%s %s %j', 1, 'a', { a: 1 });

    yield sleep(10);

    fs.readFileSync(filepath, 'utf8').should.eql('1 a {"a":1}\n');
  });

  it('should format error', function*() {
    const logger = new Logger();
    logger.set('file', transport);
    const errError = new Error('error foo');
    logger.error(errError);

    const errWarn = new Error('warn foo');
    logger.warn(errWarn);

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.containEql('nodejs.Error: error foo\n');
    content.should.containEql('nodejs.Error: warn foo\n');
    content.should.match(/pid: \d*\n/);
    content.should.containEql(`hostname: ${os.hostname()}\n`);
  });

  it('should format error with code and host properties', function*() {
    const logger = new Logger();
    logger.set('file', transport);
    const err = new Error('foo');
    err.code = 'MySome';
    err.host = 'eggjs.org';
    err.stack = null;
    logger.error(err);

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.containEql('nodejs.MySomeError: foo (eggjs.org)\n');
  });

  it('should format error getter-only stack', function*() {
    const logger = new Logger();
    logger.set('file', transport);
    const errError = new Error('error foo');
    const stack = errError.stack;
    Object.defineProperty(errError, 'stack', {
      get: () => stack,
    });
    logger.error(errError);

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.containEql('nodejs.Error: error foo\n');
    content.should.match(/pid: \d*\n/);
    content.should.containEql(`hostname: ${os.hostname()}\n`);
  });

  it('should format error with empty getter / setter stack', function*() {
    const logger = new Logger();
    logger.set('file', transport);
    const errError = new Error('error foo');
    let stack = '';
    Object.defineProperty(errError, 'stack', {
      get: () => stack,
      set: v => { stack = v; },
    });
    logger.error(errError);

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.containEql('nodejs.Error: error foo\nno_stack\n');
    content.should.match(/pid: \d*\n/);
    content.should.containEql(`hostname: ${os.hostname()}\n`);
  });

  it('should format error with properties', function*() {
    const logger = new Logger();
    logger.set('file', transport);
    const err = new Error('foo');
    err.code = 'MySome';
    err.host = 'eggjs.org';
    err.addition = {
      userId: 12345,
      message: 'mock error\n\n',
      sub: {
        foo: {},
      },
    };
    err.errors = [{
      code: 'missing_field',
      field: 'name',
      message: 'required',
    }, {
      code: 'invalid',
      field: 'age',
      message: 'should be an integer',
    }];
    err.content = '123\n123';
    err.buf = new Buffer(1000).fill(0);
    err.shortBuf = new Buffer(30).fill(101);
    err.regex = /^hello!+$/;
    err.userId = 100;
    err.longText = new Array(20000).join('1');
    err.isTrue = true;
    logger.error(err);

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.containEql('nodejs.MySomeError: foo (eggjs.org)\n');
    content.should.containEql('addition: {"userId":12345,"message":"mock error\\n\\n","sub":{"foo":{}}}');
    content.should.containEql('content: "123\\n123"');
    content.should.containEql('buf: "<Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ...(1000) >"');
    content.should.containEql('shortBuf: "<Buffer 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65>"');
    content.should.containEql('regex: "/^hello!+$/"');
    content.should.containEql('userId: 100');
    content.should.containEql('errors: [{"code":"missing_field","field":"name","message":"required"},{"code":"invalid","field":"age","message":"should be an integer"}]');
    content.should.containEql('...(19999)');
    content.should.containEql('isTrue: true');
  });

  it('should format error with options.formatter', function*() {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
      flushInterval: 10,
      formatter: meta => `${meta.date} ${meta.message}`,
    });
    logger.set('file', transport);
    const err = new Error('foo');
    logger.error(err);

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} nodejs.Error: foo\n/);
  });

  it('should log with options.formatter', function*() {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
      flushInterval: 10,
      formatter: meta => Object.keys(meta).map(key => key + ': ' + meta[key]).join('\n'),
    });
    logger.set('file', transport);
    logger.info('foo');

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.containEql('level: INFO\n');
    content.should.containEql('message: foo\n');
    content.should.match(/date: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}\n/);
    content.should.match(/pid: \d*\n/);
    content.should.containEql(`hostname: ${os.hostname()}\n`);
    // content.should.containEql('raw: false\n');
  });

  it('should support meta.formatter', function*() {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
      flushInterval: 10,
    });
    logger.set('file', transport);
    logger.log('INFO', [ 'foo' ], { formatter: meta => `${meta.pid} ${meta.message}` });

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.match(/^\d* foo\n$/);
  });

  it('should set raw=true to make log become top priority', function*() {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
      flushInterval: 10,
      formatter: meta => Object.keys(meta).map(key => key + ': ' + meta[key]).join('\n'),
    });
    logger.set('file', transport);
    logger.log('INFO', [ 'foo' ], { raw: true });

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.eql('foo\n');
  });

  it('should log save to JSON file', function*() {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
      flushInterval: 10,
      json: true,
    });
    logger.set('file', transport);
    logger.log('INFO', [ 'foo' ]);

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    const json = JSON.parse(content);
    json.level.should.eql('INFO');
    json.message.should.eql('foo');
    json.date.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}/);
    String(json.pid).should.match(/\d*/);
    json.hostname.should.eql(os.hostname());
    // json.raw.should.equal(false);
  });

  it('should be red on error console log color', () => {
    mm(chalk, 'supportsColor', true);
    mm(chalk, 'enabled', true);
    const ret = utils.consoleFormatter({
      date: '2016-02-26 16:35:40,511',
      level: 'ERROR',
      pid: '50864',
      message: 'error',
    });
    /* eslint-disable-next-line no-control-regex */
    ret.should.match(/^\u001b\[31m/);
  });

  it('should be yellow on warn console log color', () => {
    mm(chalk, 'supportsColor', true);
    mm(chalk, 'enabled', true);
    const ret = utils.consoleFormatter({
      date: '2016-02-26 16:35:40,511',
      level: 'WARN',
      pid: '50864',
      message: 'warn',
    });
    /* eslint-disable-next-line no-control-regex */
    ret.should.match(/^\u001b\[33m/);
  });

  it('should show normal color', () => {
    mm(chalk, 'supportsColor', true);
    mm(chalk, 'enabled', true);
    const ret = utils.consoleFormatter({
      date: '2016-02-26 16:35:40,511',
      level: 'INFO',
      pid: '50864',
      message: '[master] POST log (10ms)',
    });
    ret.should.containEql('\u001b[34m[master');
    ret.should.containEql('(\u001b[32m10ms\u001b[39m)');
    ret.should.containEql('\u001b[36mPOST \u001b[39m');
  });

  it('should set eol to \r\n', function*() {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
      eol: '\r\n',
    });
    logger.set('file', transport);
    logger.info('a');
    logger.write('b');

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.equal('a\r\nb\r\n');
  });

  it('should set eol to empty string', function*() {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
      eol: '',
    });
    logger.set('file', transport);
    logger.info('a');
    logger.write('b');

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.equal('ab');
  });
});
