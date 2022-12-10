'use strict';

const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const mm = require('mm');
const util = require('util');
const assert = require('assert');
const FileTransport = require('../../../index').FileTransport;
const Logger = require('../../../index').Logger;
const levels = require('../../../index');
const { sleep, rimraf } = require('../../utils');

describe('test/lib/transports/file.test.js', () => {
  const tmp = path.join(__dirname, '../../fixtures/tmp');
  afterEach(async () => {
    await rimraf(tmp);
    mm.restore();
  });

  it('should set level to levels.ERROR', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: levels.ERROR,
    }));
    logger.debug('debug', 'debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');

    await sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    assert.doesNotMatch(content, /debug foo\n/);
    assert.doesNotMatch(content, /info foo\n/);
    assert.doesNotMatch(content, /warn foo\n/);
    assert.match(content, /error foo\n/);
  });

  it('should level = info by default', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
    }));
    logger.debug('debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');

    await sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    assert.doesNotMatch(content, /debug foo\n/);
    assert.match(content, /info foo\n/);
    assert.match(content, /warn foo\n/);
    assert.match(content, /error foo\n/);
  });

  it('should log all when level = debug', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'debug',
    }));
    logger.debug('debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');

    await sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    assert.match(content, /debug foo\n/);
    assert.match(content, /info foo\n/);
    assert.match(content, /warn foo\n/);
    assert.match(content, /error foo\n/);
  });

  it('should log info, warn and error when level = info', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'info',
    }));
    logger.debug('debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');

    await sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    assert.doesNotMatch(content, /debug foo\n/);
    assert.match(content, /info foo\n/);
    assert.match(content, /warn foo\n/);
    assert.match(content, /error foo\n/);
  });

  it('should log warn and error when level = warn', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'warn',
    }));
    logger.debug('debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');

    await sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    assert.doesNotMatch(content, /debug foo\n/);
    assert.doesNotMatch(content, /info foo\n/);
    assert.match(content, /warn foo\n/);
    assert.match(content, /error foo\n/);
  });

  it('should log error only when level = error', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'error',
    }));
    logger.debug('debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');
    logger.error(new Error('error stack'));

    await sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    assert.doesNotMatch(content, /debug foo\n/);
    assert.doesNotMatch(content, /info foo\n/);
    assert.doesNotMatch(content, /warn foo\n/);
    assert.match(content, /error foo\n/);
    assert.match(content, /nodejs\.Error: error stack/);
    assert.match(content, /at Context.<anonymous>/);
  });

  it('should log nothing when level = none', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'none',
    }));
    logger.debug('debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');

    await sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    assert.strictEqual(content, '');
  });

  it('should support level = NONE', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'NONE',
    }));
    logger.debug('debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');

    await sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    assert.strictEqual(content, '');
  });

  it('should set encoding to gbk', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'ERROR',
      encoding: 'gbk',
    }));
    logger.error('中文');

    await sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'));
    assert.strictEqual(iconv.decode(content, 'gbk'), '中文\n');
  });

  it('should support close twice', () => {
    const transport = new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'ERROR',
      encoding: 'gbk',
    });
    transport.close();
    transport.close();
  });

  it('should log throw error after logger close', () => {
    let msg;
    mm(console, 'error', err => {
      msg = err;
    });
    mm(process.env, 'NODE_ENV', 'production');
    const transport = new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'ERROR',
      encoding: 'gbk',
    });
    transport.end();
    transport.log('info', 'foo');
    assert.match(msg, /test\/fixtures\/tmp\/a.log log stream had been closed/);
  });

  it('should enable/disable transport', async () => {
    const logger = new Logger();
    const transport = new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: levels.INFO,
    });
    logger.set('file', transport);
    logger.info('foo1');
    transport.disable('file');
    assert.strictEqual(transport.enabled, false);
    logger.info('foo2');
    transport.enable('file');
    assert.strictEqual(transport.enabled, true);
    logger.info('foo3');

    await sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    assert.strictEqual(content, 'foo1\nfoo3\n');
  });

  it('should reload stream when get error', async () => {
    const logfile = path.join(tmp, 'a.log');
    const logger = new Logger();
    const transport = new FileTransport({
      file: logfile,
      level: 'INFO',
    });
    logger.set('file', transport);

    // write and wait flush
    logger.info('info foo');
    await sleep(1000);

    let errorCount = 0;
    // write error
    mm(fs, 'write', (...args) => {
      const cb = args[args.length - 1];
      cb(new Error('write error'));
    });
    mm(console, 'error', (...args) => {
      errorCount++;
      const message = util.format.apply(util, args);
      const reg = new RegExp(`ERROR \\d+ \\[egg-logger] \\[${logfile.replace(/\//, '\\\/')}\] Error: write error`);
      assert(message.match(reg));
    });
    logger.info('info foo');
    await sleep(100);
    mm.restore();
    await sleep(1);
    // should be flush again
    logger.info('info foo');
    logger.info('info foo');

    await sleep(1000);
    const content = fs.readFileSync(logfile, 'utf8');
    assert(content === 'info foo\ninfo foo\ninfo foo\n');
    assert(errorCount === 1);
  });

});
