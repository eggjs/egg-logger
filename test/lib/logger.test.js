'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const iconv = require('iconv-lite');
const FileTransport = require('../..').FileTransport;
const FileBufferTransport = require('../..').FileBufferTransport;
const Logger = require('../..').Logger;
const levels = require('../..');
const { sleep, rimraf } = require('../utils');

describe('test/lib/logger.test.js', () => {
  const tmp = path.join(__dirname, '../fixtures/tmp_logger');
  let filepath;

  beforeEach(async () => {
    filepath = path.join(tmp, `logger-${Date.now()}`, 'a.log');
    await rimraf(tmp);
  });

  afterEach(async () => {
    await rimraf(tmp);
  });

  it('should not print log after transport was disabled', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: filepath,
      level: levels.INFO,
    }));
    logger.info('info foo');
    logger.disable('file');
    logger.info('disable foo');
    logger.enable('file');
    logger.info('enable foo');

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert(content.includes('info foo'));
    assert(!content.includes('disable foo'));
    assert(content.includes('enable foo'));
    logger.close();
  });

  it('should work with gbk encoding', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: filepath,
      level: levels.INFO,
      encoding: 'gbk',
    }));
    logger.info('info foo 中文');
    await sleep(10);
    const content = fs.readFileSync(filepath);
    assert.strictEqual(iconv.decode(content, 'gbk'), 'info foo 中文\n');
    logger.close();
  });

  it('should flush after buffer length > maxBufferLength on FileBufferTransport', async () => {
    const logger = new Logger();
    logger.set('file', new FileBufferTransport({
      file: filepath,
      level: levels.INFO,
      maxBufferLength: 2,
    }));
    logger.info('info foo1');
    logger.info('info foo2');
    logger.info('info foo3');
    logger.info('info foo4');
    await sleep(10);
    const content = fs.readFileSync(filepath, 'utf8');
    assert.strictEqual(content, 'info foo1\ninfo foo2\ninfo foo3\n');
    logger.close();
  });

  it('should flush gbk log after buffer length > maxBufferLength on FileBufferTransport', async () => {
    const logger = new Logger();
    logger.set('file', new FileBufferTransport({
      file: filepath,
      level: levels.INFO,
      maxBufferLength: 2,
      encoding: 'gbk',
    }));
    logger.info('info foo1 中文');
    logger.info('info foo2');
    logger.info('info foo3');
    logger.info('info foo4');
    await sleep(10);
    const content = fs.readFileSync(filepath);
    assert.strictEqual(iconv.decode(content, 'gbk'), 'info foo1 中文\ninfo foo2\ninfo foo3\n');
    logger.close();
  });

  it('should enable/disable ignore not exists transport', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: filepath,
      level: levels.INFO,
    }));
    logger.info('info foo');
    logger.disable('file1');
    logger.info('disable foo');
    logger.enable('file1');
    logger.info('enable foo');

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert(content.includes('info foo'));
    assert(content.includes('disable foo'));
    assert(content.includes('enable foo'));
    logger.close();
  });

  it('should redirect to specify logger', async () => {
    const file1 = path.join(tmp, 'a1.log');
    const file2 = path.join(tmp, 'a2.log');
    const file3 = path.join(tmp, 'a3.log');
    const logger1 = new Logger();
    logger1.set('file', new FileTransport({
      file: file1,
      level: levels.INFO,
    }));
    const logger2 = new Logger();
    logger2.set('file', new FileTransport({
      file: file2,
      level: levels.INFO,
    }));
    const logger3 = new Logger();
    logger3.set('file', new FileTransport({
      file: file3,
      level: levels.INFO,
    }));
    logger1.redirect('warn', logger2);
    logger1.redirect('error', logger2);
    // will ignore if special level had redirect
    logger1.redirect('error', logger3);
    // will un-redirect
    logger1.redirect('info', logger3);
    logger1.unredirect('info', logger3);

    logger1.info('info self');
    // write to logger2
    logger1.warn('warn logger2');
    // write to both
    logger1.error('error logger2');

    await sleep(10);

    const content1 = fs.readFileSync(file1, 'utf8');
    assert(content1 === 'info self\n');

    const content2 = fs.readFileSync(file2, 'utf8');
    assert(content2 === 'warn logger2\nerror logger2\n');

    const content3 = fs.readFileSync(file3, 'utf8');
    assert(content3 === '');
    logger1.close();
    logger2.close();
    logger3.close();
  });

  it('should duplicate to specify logger', async () => {
    const file1 = path.join(tmp, 'a1.log');
    const file11 = path.join(tmp, 'a11.log');
    const file2 = path.join(tmp, 'a2.log');
    const file3 = path.join(tmp, 'a3.log');
    const logger1 = new Logger();
    logger1.set('file', new FileTransport({
      file: file1,
      level: levels.INFO,
    }));
    logger1.set('additional', new FileTransport({
      file: file11,
      level: levels.INFO,
    }));
    const logger2 = new Logger();
    logger2.set('file', new FileTransport({
      file: file2,
      level: levels.INFO,
    }));
    const logger3 = new Logger();
    logger3.set('file', new FileTransport({
      file: file3,
      level: levels.INFO,
    }));
    logger1.duplicate('warn', logger2);
    logger1.duplicate('error', logger2, { excludes: [ 'additional' ] });
    // will ignore if special level had redirect
    logger1.duplicate('error', logger3);

    // will un-duplicate
    logger1.duplicate('info', logger3);
    logger1.unduplicate('info', logger3);

    logger1.info('info self');
    // write to logger2
    logger1.warn('warn logger2');
    // write to both
    logger1.error('error logger2');

    await sleep(10);

    const content1 = fs.readFileSync(file1, 'utf8');
    assert(content1 === 'info self\nwarn logger2\nerror logger2\n');

    const content11 = fs.readFileSync(file11, 'utf8');
    assert(content11 === 'info self\nwarn logger2\n');

    const content2 = fs.readFileSync(file2, 'utf8');
    assert(content2 === 'warn logger2\nerror logger2\n');


    const content3 = fs.readFileSync(file3, 'utf8');
    assert(content3 === '');
    logger1.close();
    logger2.close();
    logger3.close();
  });

  it('should end all transports', () => {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
    });
    logger.set('file', transport);
    logger.end();
    assert.strictEqual(transport._stream, null);
  });

  it.skip('should reload all transports', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: filepath,
      level: levels.INFO,
    }));
    rimraf.sync(path.dirname(filepath));
    logger.info('info foo1');
    // flush log after reload
    logger.reload();
    logger.info('info foo2');

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert.strictEqual(content, 'info foo1\ninfo foo2\n');
    logger.close();
  });

  it('should write raw string and ignore level', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: filepath,
      level: levels.ERROR,
    }));
    // warn don't log
    logger.warn('warn');
    logger.write('none');

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert.strictEqual(content, 'none\n');
    logger.close();
  });

  it('should write ignore formatter', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: filepath,
      level: levels.INFO,
      formatter: meta => `${meta.pid} ${meta.message}`,
    }));
    logger.info('info');
    logger.write('write');

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert.match(content, /^\d* info\nwrite\n$/);
    logger.close();
  });

  it('should write default support util.format', async () => {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: filepath,
      level: levels.INFO,
      formatter: meta => `${meta.pid} ${meta.message}`,
    }));
    logger.write('write %j', { foo: 'bar' });

    await sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    assert.match(content, /^write {"foo":"bar"}\n$/);
    logger.close();
  });

  it('should log into multi transports', async () => {
    const file1 = path.join(tmp, 'a1.log');
    const file2 = path.join(tmp, 'a2.log');
    const file3 = path.join(tmp, 'a3.log');
    const logger = new Logger();
    logger.set('file1', new FileTransport({
      file: file1,
    }));
    logger.set('file2', new FileTransport({
      file: file2,
    }));
    logger.set('file3', new FileTransport({
      file: file3,
    }));
    logger.info('foo1');

    await sleep(100);

    assert.strictEqual(fs.readFileSync(file1, 'utf8'), 'foo1\n');
    assert.strictEqual(fs.readFileSync(file2, 'utf8'), 'foo1\n');
    assert.strictEqual(fs.readFileSync(file3, 'utf8'), 'foo1\n');

    logger.get('file3').disable();
    logger.info('foo2');

    await sleep(100);

    assert.strictEqual(fs.readFileSync(file1, 'utf8'), 'foo1\nfoo2\n');
    assert.strictEqual(fs.readFileSync(file2, 'utf8'), 'foo1\nfoo2\n');
    assert.strictEqual(fs.readFileSync(file3, 'utf8'), 'foo1\n');
    logger.close();
  });
});
