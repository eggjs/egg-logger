'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const sleep = require('ko-sleep');
const mm = require('mm');
const util = require('util');
const assert = require('assert');
const FileBufferTransport = require('../../../index').FileBufferTransport;
const Logger = require('../../../index').Logger;

describe('test/transports/file_buffer.test.js', () => {

  const tmp = path.join(__dirname, '../../fixtures/tmp');
  afterEach(() => {
    rimraf.sync(tmp);
  });

  it('should write to file after flushInterval hit', function*() {
    const logger = new Logger();
    const transport = new FileBufferTransport({
      file: path.join(tmp, 'a.log'),
      level: 'INFO',
    });
    logger.set('file', transport);
    logger.info('info foo');

    // flush is 1000 by default
    yield sleep(100);
    transport._buf.length.should.not.eql(0);
    let content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    content.should.eql('');

    yield sleep(1000);
    content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    content.should.eql('info foo\n');
  });

  it('should close timer after logger close', () => {
    const transport = new FileBufferTransport({
      file: path.join(tmp, 'a.log'),
      level: 'INFO',
    });
    transport.end();
    (transport._timer === null).should.equal(true);
  });

  it('should reload stream when get error', function* () {
    const logfile = path.join(tmp, 'a.log');
    const logger = new Logger();
    const transport = new FileBufferTransport({
      file: logfile,
      level: 'INFO',
    });
    logger.set('file', transport);

    // write and wait flush
    logger.info('info foo');
    yield sleep(1500);

    // write error
    mm(fs, 'write', function() {
      const cb = arguments[arguments.length - 1];
      cb(new Error('write error'));
    });
    mm(console, 'error', function() {
      const message = util.format.apply(util, arguments);
      const reg = new RegExp(`ERROR \\d+ \\[egg-logger] \\[${logfile.replace(/\//, '\\\/')}\] Error: write error`);
      assert(message.match(reg));
    });
    logger.info('info foo');
    logger.info('info foo');
    yield sleep(1500);
    mm.restore();

    // should be flush again
    logger.info('info foo');
    logger.info('info foo');
    yield sleep(1500);

    const content = fs.readFileSync(logfile, 'utf8');
    assert(content === 'info foo\ninfo foo\ninfo foo\n');
  });

});
