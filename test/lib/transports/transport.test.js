'use strict';

const os = require('os');
const path = require('path');
const rimraf = require('rimraf');
const mm = require('mm');
const assert = require('assert');
const Transport = require('../../../index').Transport;
const FileTransport = require('../../../index').FileTransport;
const FileBufferTransport = require('../../../index').FileBufferTransport;
const ConsoleTransport = require('../../../index').ConsoleTransport;
const levels = require('../../../index');

describe('test/lib/transports/transport.test.js', () => {
  const filepath = path.join(__dirname, '../../fixtures/tmp/a.log');

  afterEach(() => {
    mm.restore();
    rimraf.sync(path.dirname(filepath));
  });

  it('should always create new options', () => {
    const options = {};
    const transport = new Transport(options);
    transport.options.should.not.equal(options);
  });

  it('Transport default params', () => {
    const transport = new Transport();
    transport.options.should.eql({
      level: levels.NONE,
      formatter: null,
      contextFormatter: null,
      json: false,
      encoding: 'utf8',
      eol: os.EOL,
    });
  });

  it('should overide Transport default params', () => {
    const transport = new Transport({
      level: 'ERROR',
      formatter: meta => meta,
      json: true,
      encoding: 'gbk',
    });
    transport.options.should.eql({
      level: levels.ERROR,
      formatter: meta => meta,
      contextFormatter: null,
      json: true,
      encoding: 'gbk',
      eol: os.EOL,
    });
  });

  it('should set/get level', () => {
    const transport = new Transport({
      file: filepath,
      level: 'INFO',
    });
    assert(transport.options.level === levels.INFO);

    transport.level = 'WARN';
    assert(transport.options.level === levels.WARN);
    assert(transport.level === levels.WARN);

    transport.level = levels.ERROR;
    assert(transport.options.level === levels.ERROR);
    assert(transport.level === levels.ERROR);
  });

  it('FileTransport default params', () => {
    const transport = new FileTransport({
      file: filepath,
    });
    transport.options.should.eql({
      file: filepath,
      level: levels.INFO,
      formatter: null,
      contextFormatter: null,
      json: false,
      encoding: 'utf8',
      eol: os.EOL,
    });
  });

  it('should overide FileTransport default params', () => {
    const transport = new FileTransport({
      file: filepath,
      level: 'ERROR',
      formatter: meta => meta,
      json: true,
      encoding: 'gbk',
    });
    transport.options.should.eql({
      file: filepath,
      level: levels.ERROR,
      formatter: meta => meta,
      contextFormatter: null,
      json: true,
      encoding: 'gbk',
      eol: os.EOL,
    });
  });

  it('FileBufferTransport default params', () => {
    const transport = new FileBufferTransport({
      file: filepath,
    });
    transport.options.should.eql({
      file: filepath,
      level: levels.INFO,
      flushInterval: 1000,
      maxBufferLength: 1000,
      formatter: null,
      contextFormatter: null,
      json: false,
      encoding: 'utf8',
      eol: os.EOL,
    });
    transport.close();
  });

  it('should overide FileBufferTransport default params', () => {
    const transport = new FileBufferTransport({
      file: filepath,
      flushInterval: 1,
      maxBufferLength: 10,
      level: 'ERROR',
      formatter: meta => meta,
      json: true,
      encoding: 'gbk',
    });
    transport.options.should.eql({
      file: filepath,
      flushInterval: 1,
      maxBufferLength: 10,
      level: levels.ERROR,
      formatter: meta => meta,
      contextFormatter: null,
      json: true,
      encoding: 'gbk',
      eol: os.EOL,
    });
    transport.close();
  });

  it('should auto convert utf-8 to utf8', () => {
    const transport = new FileBufferTransport({
      file: filepath,
      flushInterval: 1,
      maxBufferLength: 10,
      level: 'ERROR',
      formatter: meta => meta,
      json: true,
      encoding: 'utf-8',
    });
    transport.options.should.eql({
      file: filepath,
      flushInterval: 1,
      maxBufferLength: 10,
      level: levels.ERROR,
      formatter: meta => meta,
      contextFormatter: null,
      json: true,
      encoding: 'utf8',
      eol: os.EOL,
    });
    transport.close();
  });

  it('should throw error when file is null', () => {
    (() => {
      new FileTransport();
    }).should.throw('should pass options.file');
    (() => {
      new FileBufferTransport();
    }).should.throw('should pass options.file');
  });

  it('ConsoleTransport default params', () => {
    const transport = new ConsoleTransport();
    transport.options.should.eql({
      stderrLevel: levels.ERROR,
      level: levels.NONE,
      formatter: null,
      contextFormatter: null,
      json: false,
      encoding: 'utf8',
      eol: os.EOL,
    });
  });

  it('should overide ConsoleTransport default params', () => {
    const transport = new ConsoleTransport({
      stderrLevel: 'WARN',
      level: 'ERROR',
      formatter: meta => meta,
      json: true,
      encoding: 'gbk',
      eol: '\r',
    });
    transport.options.should.eql({
      stderrLevel: levels.WARN,
      level: levels.ERROR,
      formatter: meta => meta,
      contextFormatter: null,
      json: true,
      encoding: 'gbk',
      eol: '\r',
    });
  });

  it('ConsoleTransport can set by EGG_LOG env', () => {
    mm(process.env, 'EGG_LOG', 'warn');

    let transport = new ConsoleTransport();
    transport.options.level.should.eql(levels.WARN);

    transport = new ConsoleTransport({
      level: 'ERROR',
    });
    transport.options.level.should.eql(levels.WARN);
  });
});
