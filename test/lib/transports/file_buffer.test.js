'use strict';

const fs = require('fs');
const path = require('path');
const mm = require('mm');
const util = require('util');
const assert = require('assert');
const { FileBufferTransport, Logger } = require('../../..');
const { sleep, rimraf } = require('../../utils');

describe('test/lib/transports/file_buffer.test.js', () => {
  const tmp = path.join(__dirname, '../../fixtures/tmp_file_buffer');
  let filepath;
  beforeEach(() => {
    filepath = path.join(tmp, `transports_file_buffer_${Date.now()}`, 'a.log');
  });

  afterEach(() => {
    mm.restore();
  });

  after(async () => {
    await rimraf(tmp);
  });

  it('should write to file after flushInterval hit', async () => {
    const logger = new Logger();
    const transport = new FileBufferTransport({
      file: filepath,
      level: 'INFO',
    });
    logger.set('file', transport);
    logger.info('info foo');

    // flush is 1000 by default
    await sleep(100);
    assert.strictEqual(transport._buf.length > 0, true);
    let content = fs.readFileSync(filepath, 'utf8');
    assert.strictEqual(content, '');

    await sleep(1000);
    content = fs.readFileSync(filepath, 'utf8');
    assert.strictEqual(content, 'info foo\n');
    logger.close();
  });

  it('should close timer after logger close', () => {
    const transport = new FileBufferTransport({
      file: filepath,
      level: 'INFO',
    });
    transport.end();
    assert.strictEqual(transport._timer, null);
  });

  it('should reload stream when get error', async () => {
    const logfile = filepath;
    const logger = new Logger();
    const transport = new FileBufferTransport({
      file: logfile,
      level: 'INFO',
    });
    logger.set('file', transport);

    // write and wait flush
    logger.info('info foo');
    await sleep(1500);

    // write error
    mm(fs, 'write', (...args) => {
      const cb = args[args.length - 1];
      cb(new Error('write error'));
    });
    mm(console, 'error', (...args) => {
      const message = util.format.apply(util, args);
      const reg = new RegExp(`ERROR \\d+ \\[egg-logger] \\[${logfile.replace(/\//, '\\\/')}\] Error: write error`);
      assert(message.match(reg));
    });
    logger.info('info foo');
    logger.info('info foo');
    await sleep(1500);
    mm.restore();

    // should be flush again
    logger.info('info foo');
    logger.info('info foo');
    await sleep(1500);

    const content = fs.readFileSync(logfile, 'utf8');
    assert(content === 'info foo\ninfo foo\ninfo foo\n');
    logger.close();
  });

});
