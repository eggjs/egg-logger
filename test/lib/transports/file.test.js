'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const iconv = require('iconv-lite');
const sleep = require('ko-sleep');
const mm = require('mm');
const util = require('util');
const assert = require('assert');
const FileTransport = require('../../../index').FileTransport;
const Logger = require('../../../index').Logger;
const levels = require('../../../index');

describe('test/transports/file.test.js', () => {

  const tmp = path.join(__dirname, '../../fixtures/tmp');
  afterEach(() => {
    rimraf.sync(tmp);
  });

  it('should set level to levels.ERROR', function*() {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: levels.ERROR,
    }));
    logger.debug('debug', 'debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');

    yield sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    content.should.not.match(/debug foo\n/);
    content.should.not.match(/info foo\n/);
    content.should.not.match(/warn foo\n/);
    content.should.match(/error foo\n/);
  });

  it('should level = info by default', function*() {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
    }));
    logger.debug('debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');

    yield sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    content.should.not.match(/debug foo\n/);
    content.should.match(/info foo\n/);
    content.should.match(/warn foo\n/);
    content.should.match(/error foo\n/);
  });

  it('should log all when level = debug', function*() {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'debug',
    }));
    logger.debug('debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');

    yield sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    content.should.match(/debug foo\n/);
    content.should.match(/info foo\n/);
    content.should.match(/warn foo\n/);
    content.should.match(/error foo\n/);
  });

  it('should log info, warn and error when level = info', function*() {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'info',
    }));
    logger.debug('debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');

    yield sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    content.should.not.match(/debug foo\n/);
    content.should.match(/info foo\n/);
    content.should.match(/warn foo\n/);
    content.should.match(/error foo\n/);
  });

  it('should log warn and error when level = warn', function*() {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'warn',
    }));
    logger.debug('debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');

    yield sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    content.should.not.match(/debug foo\n/);
    content.should.not.match(/info foo\n/);
    content.should.match(/warn foo\n/);
    content.should.match(/error foo\n/);
  });

  it('should log error only when level = error', function*() {
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

    yield sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    content.should.not.match(/debug foo\n/);
    content.should.not.match(/info foo\n/);
    content.should.not.match(/warn foo\n/);
    content.should.match(/error foo\n/);
    content.should.match(/nodejs\.Error: error stack/);
    content.should.match(/at Context.<anonymous>/);
  });

  it('should log nothing when level = none', function*() {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'none',
    }));
    logger.debug('debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');

    yield sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    content.should.eql('');
  });

  it('should support level = NONE', function*() {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'NONE',
    }));
    logger.debug('debug foo');
    logger.info('info foo');
    logger.warn('warn foo');
    logger.error('error foo');

    yield sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    content.should.eql('');
  });

  it('should set encoding to gbk', function*() {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'ERROR',
      encoding: 'gbk',
    }));
    logger.error('中文');

    yield sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'));
    iconv.decode(content, 'gbk').should.eql('中文\n');
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
    const transport = new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: 'ERROR',
      encoding: 'gbk',
    });
    transport.end();
    transport.log('info', 'foo');
    msg.should.match(/test\/fixtures\/tmp\/a.log log stream had been closed/);
  });

  it('should enable/disable transport', function*() {
    const logger = new Logger();
    const transport = new FileTransport({
      file: path.join(tmp, 'a.log'),
      level: levels.INFO,
    });
    logger.set('file', transport);
    logger.info('foo1');
    transport.disable('file');
    transport.enabled.should.equal(false);
    logger.info('foo2');
    transport.enable('file');
    transport.enabled.should.equal(true);
    logger.info('foo3');

    yield sleep(10);

    const content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    content.should.eql('foo1\nfoo3\n');
  });

  it('should reload stream when get error', function* () {
    const logfile = path.join(tmp, 'a.log');
    const logger = new Logger();
    const transport = new FileTransport({
      file: logfile,
      level: 'INFO',
    });
    logger.set('file', transport);

    // write and wait flush
    logger.info('info foo');
    yield sleep(1000);

    let errorCount = 0;
    // write error
    mm(fs, 'write', function() {
      const cb = arguments[arguments.length - 1];
      cb(new Error('write error'));
    });
    mm(console, 'error', function() {
      errorCount++;
      const message = util.format.apply(util, arguments);
      const reg = new RegExp(`ERROR \\d+ \\[egg-logger] \\[${logfile.replace(/\//, '\\\/')}\] Error: write error`);
      assert(message.match(reg));
    });
    logger.info('info foo');
    logger.info('info foo');
    yield sleep(1);
    logger.info('info foo');
    yield sleep(1);
    mm.restore();

    yield sleep(1);
    // should be flush again
    logger.info('info foo');
    logger.info('info foo');

    yield sleep(1000);
    const content = fs.readFileSync(logfile, 'utf8');
    assert(content === 'info foo\ninfo foo\ninfo foo\n');
    assert(errorCount === 3);
  });

});
