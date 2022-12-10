'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { rimraf } = require('../utils');
const mm = require('mm');
const chalk = require('chalk');
const { FrameworkBaseError } = require('egg-errors');
const FileTransport = require('../../index').FileTransport;
const Logger = require('../../index').Logger;
const levels = require('../../index');
const utils = require('../../lib/utils');
const { sleep } = require('../utils');

describe('test/lib/formatter.test.js', () => {
  const tmp = path.join(__dirname, '../fixtures/tmp');
  const filepath = path.join(tmp, 'formatter.a.log');

  let transport;
  before(() => {
    transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
    });
  });

  afterEach(async () => {
    mm.restore();
    await rimraf(path.dirname(filepath));
    transport.reload();
  });

  it('should use util.format handle arguments', async () => {
    const logger = new Logger();
    logger.set('file', transport);
    logger.info('%s %s %j', 1, 'a', { a: 1 });

    await sleep(10);

    assert.strictEqual(fs.readFileSync(filepath, 'utf8'), '1 a {"a":1}\n');
  });

  it('should format error', async () => {
    const logger = new Logger();
    logger.set('file', transport);
    const errError = new Error('error foo');
    logger.error(errError);

    const errWarn = new Error('warn foo');
    logger.warn(errWarn);

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert(content.includes('nodejs.Error: error foo\n'));
    assert(content.includes('nodejs.Error: warn foo\n'));
    assert.match(content, /pid: \d*\n/);
    assert(content.includes(`hostname: ${os.hostname()}\n`));
  });

  it('should format error with code and host properties', async () => {
    const logger = new Logger();
    logger.set('file', transport);
    const err = new Error('foo');
    err.code = 'MySome';
    err.host = 'eggjs.org';
    err.stack = null;
    logger.error(err);

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert(content.includes('nodejs.MySomeError: foo (eggjs.org)\n'));
  });

  it('should format error getter-only stack', async () => {
    const logger = new Logger();
    logger.set('file', transport);
    const errError = new Error('error foo');
    const stack = errError.stack;
    Object.defineProperty(errError, 'stack', {
      get: () => stack,
    });
    logger.error(errError);

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert(content.includes('nodejs.Error: error foo\n'));
    assert.match(content, /pid: \d*\n/);
    assert(content.includes(`hostname: ${os.hostname()}\n`));
  });

  it('should format error with empty getter / setter stack', async () => {
    const logger = new Logger();
    logger.set('file', transport);
    const errError = new Error('error foo');
    let stack = '';
    Object.defineProperty(errError, 'stack', {
      get: () => stack,
      set: v => { stack = v; },
    });
    logger.error(errError);

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert(content.includes('nodejs.Error: error foo\nno_stack\n'));
    assert.match(content, /pid: \d*\n/);
    assert(content.includes(`hostname: ${os.hostname()}\n`));
  });

  it('should format error with properties', async () => {
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
    err.buf = Buffer.alloc(1000).fill(0);
    err.shortBuf = Buffer.alloc(30).fill(101);
    err.regex = /^hello!+$/;
    err.userId = 100;
    err.longText = new Array(20000).join('1');
    err.isTrue = true;
    logger.error(err);

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert(content.includes('nodejs.MySomeError: foo (eggjs.org)\n'));
    assert(content.includes('addition: {"userId":12345,"message":"mock error\\n\\n","sub":{"foo":{}}}'));
    assert(content.includes('content: "123\\n123"'));
    assert(content.includes('buf: "<Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ...(1000) >"'));
    assert(content.includes('shortBuf: "<Buffer 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65 65>"'));
    assert(content.includes('regex: "/^hello!+$/"'));
    assert(content.includes('userId: 100'));
    assert(content.includes('errors: [{"code":"missing_field","field":"name","message":"required"},{"code":"invalid","field":"age","message":"should be an integer"}]'));
    assert(content.includes('...(19999)'));
    assert(content.includes('isTrue: true'));
  });

  it('should format error with options.formatter', async () => {
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

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert.match(content, /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} nodejs.Error: foo\n/);
  });

  describe('should format FrameworkError', () => {
    class CustomError extends FrameworkBaseError {
      get module() {
        return 'customPlugin';
      }
    }

    it('format work', async () => {
      const logger = new Logger();
      logger.set('file', transport);
      const err = new CustomError('foo', '00');
      logger.error(err);

      await sleep(10);

      const content = fs.readFileSync(filepath, 'utf8');
      assert(content.includes('framework.CustomError: foo [ https://eggjs.org/zh-cn/faq/customPlugin_00 ]\n'));
    });

    it('format work with options.formatter work', async () => {
      const logger = new Logger();
      const transport = new FileTransport({
        file: filepath,
        level: levels.INFO,
        flushInterval: 10,
        formatter: meta => `${meta.date} ${meta.message}`,
      });
      logger.set('file', transport);
      const err = new CustomError('foo', '00');
      logger.error(err);

      await sleep(10);

      const content = fs.readFileSync(filepath, 'utf8');
      assert.match(content, /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} framework.CustomError: foo \[ https\:\/\/eggjs\.org\/zh-cn\/faq\/customPlugin_00 \]\n/);
    });
  });

  it('should log with options.formatter', async () => {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
      flushInterval: 10,
      formatter: meta => Object.keys(meta).map(key => key + ': ' + meta[key]).join('\n'),
    });
    logger.set('file', transport);
    logger.info('foo');

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert(content.includes('level: INFO\n'));
    assert(content.includes('message: foo\n'));
    assert.match(content, /date: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}\n/);
    assert.match(content, /pid: \d*\n/);
    assert(content.includes(`hostname: ${os.hostname()}\n`));
    // assert(content.includes(('raw: false\n'));
  });

  it('should support meta.formatter', async () => {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
      flushInterval: 10,
    });
    logger.set('file', transport);
    logger.log('INFO', [ 'foo' ], { formatter: meta => `${meta.pid} ${meta.message}` });

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert.match(content, /^\d* foo\n$/);
  });

  it('should set raw=true to make log become top priority', async () => {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
      flushInterval: 10,
      formatter: meta => Object.keys(meta).map(key => key + ': ' + meta[key]).join('\n'),
    });
    logger.set('file', transport);
    logger.log('INFO', [ 'foo' ], { raw: true });

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert.strictEqual(content, 'foo\n');
  });

  it('should log save to JSON file', async () => {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
      flushInterval: 10,
      json: true,
    });
    logger.set('file', transport);
    logger.log('INFO', [ 'foo' ]);

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    const json = JSON.parse(content);
    assert.strictEqual(json.level, 'INFO');
    assert.strictEqual(json.message, 'foo');
    assert.match(json.date, /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}/);
    assert.match(String(json.pid), /\d*/);
    assert.strictEqual(json.hostname, os.hostname());
  });

  // chalk color disable on github action env
  if (!process.env.GITHUB_ACTION) {
    it('should be red on error console log color', () => {
      mm(process.env, 'FORCE_COLOR', 'true');
      mm(chalk, 'supportsColor', true);
      mm(chalk, 'enabled', true);
      const ret = utils.consoleFormatter({
        date: '2016-02-26 16:35:40,511',
        level: 'ERROR',
        pid: '50864',
        message: 'error',
      });
      /* eslint-disable-next-line no-control-regex */
      assert.match(ret, /^\u001b\[31m/);
    });

    it('should be yellow on warn console log color', () => {
      mm(process.env, 'FORCE_COLOR', 'true');
      mm(chalk, 'supportsColor', true);
      mm(chalk, 'enabled', true);
      const ret = utils.consoleFormatter({
        date: '2016-02-26 16:35:40,511',
        level: 'WARN',
        pid: '50864',
        message: 'warn',
      });
      /* eslint-disable-next-line no-control-regex */
      assert.match(ret, /^\u001b\[33m/);
    });

    it('should show normal color', () => {
      mm(process.env, 'FORCE_COLOR', 'true');
      mm(chalk, 'supportsColor', true);
      mm(chalk, 'enabled', true);
      const ret = utils.consoleFormatter({
        date: '2016-02-26 16:35:40,511',
        level: 'INFO',
        pid: '50864',
        message: '[master] POST log (10ms)',
      });
      assert(ret.includes('\u001b[34m[master'));
      assert(ret.includes('(\u001b[32m10ms\u001b[39m)'));
      assert(ret.includes('\u001b[36mPOST \u001b[39m'));
    });
  }

  it('should set eol to \r\n', async () => {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
      eol: '\r\n',
    });
    logger.set('file', transport);
    logger.info('a');
    logger.write('b');

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert.strictEqual(content, 'a\r\nb\r\n');
  });

  it('should set eol to empty string', async () => {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
      eol: '',
    });
    logger.set('file', transport);
    logger.info('a');
    logger.write('b');

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert.strictEqual(content, 'ab');
  });
});
