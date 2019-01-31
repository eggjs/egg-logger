'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const rimraf = require('rimraf');
const sleep = require('ko-sleep');
const iconv = require('iconv-lite');
const FileTransport = require('../..').FileTransport;
const FileBufferTransport = require('../..').FileBufferTransport;
const Logger = require('../..').Logger;
const levels = require('../..');

describe('test/lib/logger.test.js', () => {
  const tmp = path.join(__dirname, '../fixtures/tmp');
  const filepath = path.join(tmp, 'a.log');

  beforeEach(() => {
    rimraf.sync(path.dirname(filepath));
  });

  afterEach(() => {
    rimraf.sync(path.dirname(filepath));
  });

  it('should not print log after transport was disabled', function*() {
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

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.containEql('info foo');
    content.should.not.containEql('disable foo');
    content.should.containEql('enable foo');
  });

  it('should work with gbk encoding', function*() {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: filepath,
      level: levels.INFO,
      encoding: 'gbk',
    }));
    logger.info('info foo 中文');
    yield sleep(10);
    const content = fs.readFileSync(filepath);
    iconv.decode(content, 'gbk').should.equal('info foo 中文\n');
  });

  it('should flush after buffer length > maxBufferLength on FileBufferTransport', function*() {
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
    yield sleep(10);
    const content = fs.readFileSync(filepath, 'utf8');
    content.should.equal('info foo1\ninfo foo2\ninfo foo3\n');
    logger.close();
  });

  it('should flush gbk log after buffer length > maxBufferLength on FileBufferTransport', function*() {
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
    yield sleep(10);
    const content = fs.readFileSync(filepath);
    iconv.decode(content, 'gbk').should.equal('info foo1 中文\ninfo foo2\ninfo foo3\n');
    logger.close();
  });

  it('should enable/disable ignore not exists transport', function*() {
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

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.containEql('info foo');
    content.should.containEql('disable foo');
    content.should.containEql('enable foo');
  });

  it('should redirect to specify logger', function*() {
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

    yield sleep(10);

    const content1 = fs.readFileSync(file1, 'utf8');
    assert(content1 === 'info self\n');

    const content2 = fs.readFileSync(file2, 'utf8');
    assert(content2 === 'warn logger2\nerror logger2\n');

    const content3 = fs.readFileSync(file3, 'utf8');
    assert(content3 === '');
  });

  it('should duplicate to specify logger', function* () {
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

    yield sleep(10);

    const content1 = fs.readFileSync(file1, 'utf8');
    assert(content1 === 'info self\nwarn logger2\nerror logger2\n');

    const content11 = fs.readFileSync(file11, 'utf8');
    assert(content11 === 'info self\nwarn logger2\n');

    const content2 = fs.readFileSync(file2, 'utf8');
    assert(content2 === 'warn logger2\nerror logger2\n');


    const content3 = fs.readFileSync(file3, 'utf8');
    assert(content3 === '');
  });

  it('should end all transports', () => {
    const logger = new Logger();
    const transport = new FileTransport({
      file: filepath,
      level: levels.INFO,
    });
    logger.set('file', transport);
    logger.end();
    (transport._stream === null).should.equal(true);
  });

  it.skip('should reload all transports', function*() {
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

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.eql('info foo1\ninfo foo2\n');
  });

  it('should write raw string and ignore level', function*() {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: filepath,
      level: levels.ERROR,
    }));
    // warn don't log
    logger.warn('warn');
    logger.write('none');

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.eql('none\n');
  });

  it('should write ignore formatter', function*() {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: filepath,
      level: levels.INFO,
      formatter: meta => `${meta.pid} ${meta.message}`,
    }));
    logger.info('info');
    logger.write('write');

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.match(/^\d* info\nwrite\n$/);
  });

  it('should write default support util.format', function*() {
    const logger = new Logger();
    logger.set('file', new FileTransport({
      file: filepath,
      level: levels.INFO,
      formatter: meta => `${meta.pid} ${meta.message}`,
    }));
    logger.write('write %j', { foo: 'bar' });

    yield sleep(10);

    const content = fs.readFileSync(filepath, 'utf8');
    content.should.match(/^write {"foo":"bar"}\n$/);
  });

  it('should log into multi transports', function*() {
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

    yield sleep(100);

    fs.readFileSync(file1, 'utf8').should.eql('foo1\n');
    fs.readFileSync(file2, 'utf8').should.eql('foo1\n');
    fs.readFileSync(file3, 'utf8').should.eql('foo1\n');

    logger.get('file3').disable();
    logger.info('foo2');

    yield sleep(100);

    fs.readFileSync(file1, 'utf8').should.eql('foo1\nfoo2\n');
    fs.readFileSync(file2, 'utf8').should.eql('foo1\nfoo2\n');
    fs.readFileSync(file3, 'utf8').should.eql('foo1\n');
  });
});
