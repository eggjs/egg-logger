'use strict';

const os = require('os');
const path = require('path');
const mm = require('mm');
const assert = require('assert');
const {
  levels,
  Transport,
  FileTransport,
  FileBufferTransport,
  ConsoleTransport,
} = require('../../..');
const { rimraf } = require('../../utils');

describe('test/lib/transports/transport.test.js', () => {
  const tmp = path.join(__dirname, '../../fixtures/tmp_file_buffer');
  let filepath;
  beforeEach(() => {
    filepath = path.join(tmp, `transport-${Date.now()}`, 'a.log');
  });

  afterEach(() => {
    mm.restore();
  });

  after(async () => {
    await rimraf(tmp);
  });

  it('should always create new options', () => {
    const options = {};
    const transport = new Transport(options);
    assert(transport.options !== options);
  });

  it('Transport default params', () => {
    const transport = new Transport();
    assert.deepStrictEqual(transport.options, {
      level: levels.NONE,
      formatter: null,
      contextFormatter: null,
      json: false,
      encoding: 'utf8',
      eol: os.EOL,
    });
  });

  it('should overide Transport default params', () => {
    const formatter = meta => meta;
    const transport = new Transport({
      level: 'ERROR',
      formatter,
      json: true,
      encoding: 'gbk',
    });
    assert(transport.options.formatter === formatter);
    assert.deepStrictEqual(transport.options, {
      level: levels.ERROR,
      formatter,
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
    assert.deepStrictEqual(transport.options, {
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
    const formatter = meta => meta;
    const transport = new FileTransport({
      file: filepath,
      level: 'ERROR',
      formatter,
      json: true,
      encoding: 'gbk',
    });
    assert.deepStrictEqual(transport.options, {
      file: filepath,
      level: levels.ERROR,
      formatter,
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
    assert.deepStrictEqual(transport.options, {
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
    const formatter = meta => meta;
    const transport = new FileBufferTransport({
      file: filepath,
      flushInterval: 1,
      maxBufferLength: 10,
      level: 'ERROR',
      formatter,
      json: true,
      encoding: 'gbk',
    });
    assert.deepStrictEqual(transport.options, {
      file: filepath,
      flushInterval: 1,
      maxBufferLength: 10,
      level: levels.ERROR,
      formatter,
      contextFormatter: null,
      json: true,
      encoding: 'gbk',
      eol: os.EOL,
    });
    transport.close();
  });

  it('should auto convert utf-8 to utf8', () => {
    const formatter = meta => meta;
    const transport = new FileBufferTransport({
      file: filepath,
      flushInterval: 1,
      maxBufferLength: 10,
      level: 'ERROR',
      formatter,
      json: true,
      encoding: 'utf-8',
    });
    assert.deepStrictEqual(transport.options, {
      file: filepath,
      flushInterval: 1,
      maxBufferLength: 10,
      level: levels.ERROR,
      formatter,
      contextFormatter: null,
      json: true,
      encoding: 'utf8',
      eol: os.EOL,
    });
    transport.close();
  });

  it('should throw error when file is null', () => {
    assert.throws(() => {
      new FileTransport();
    }, /should pass options\.file/);
    assert.throws(() => {
      new FileBufferTransport();
    }, /should pass options\.file/);
  });

  it('ConsoleTransport default params', () => {
    const transport = new ConsoleTransport();
    assert.deepStrictEqual(transport.options, {
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
    const formatter = meta => meta;
    const transport = new ConsoleTransport({
      stderrLevel: 'WARN',
      level: 'ERROR',
      formatter,
      json: true,
      encoding: 'gbk',
      eol: '\r',
    });
    assert.deepStrictEqual(transport.options, {
      stderrLevel: levels.WARN,
      level: levels.ERROR,
      formatter,
      contextFormatter: null,
      json: true,
      encoding: 'gbk',
      eol: '\r',
    });
  });

  it('ConsoleTransport can set by EGG_LOG env', () => {
    mm(process.env, 'EGG_LOG', 'warn');

    let transport = new ConsoleTransport();
    assert(transport.options.level === levels.WARN);

    transport = new ConsoleTransport({
      level: 'ERROR',
    });
    assert(transport.options.level === levels.WARN);
  });
});
