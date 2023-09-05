'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const coffee = require('coffee');
const { rimraf } = require('../../utils');
const EggErrorLogger = require('../../../index').EggErrorLogger;
const levels = require('../../../index');
const utils = require('../../../lib/utils');

describe('test/lib/egg/error_logger.test.js', () => {
  const errorLoggerFile = path.join(__dirname, '../../fixtures/egg_error_logger.js');
  const filepath = path.join(__dirname, '../../fixtures/tmp/a.log');

  afterEach(async () => {
    await rimraf(path.dirname(filepath));
  });

  it('default params', () => {
    const logger = new EggErrorLogger({
      file: filepath,
    });
    assert.deepStrictEqual(logger.options, {
      buffer: true,
      file: filepath,
      encoding: 'utf8',
      level: levels.ERROR,
      consoleLevel: levels.ERROR,
      jsonFile: '',
      outputJSON: false,
      outputJSONOnly: false,
      dateISOFormat: false,
      formatter: utils.defaultFormatter,
      maxCauseChainLength: 10,
    });
  });

  it('should log error level only', done => {
    const options = {
      file: filepath,
      flushInterval: 10,
    };
    coffee.fork(errorLoggerFile, [ JSON.stringify(options) ])
      .expect('stdout', '')
      .expect('stderr', /ERROR \d+ error foo/)
      .end(function(err) {
        assert(!err);

        const content = fs.readFileSync(filepath, 'utf8');
        assert.doesNotMatch(content, /WARN \d+ warn foo/);
        assert.match(content, /ERROR \d+ error foo/);
        done();
      });
  });

  it('can\'t set level and consoleLevel', done => {
    const options = {
      file: path.join(__dirname, '../../fixtures/tmp/a.log'),
      level: 'WARN',
      consoleLevel: 'WARN',
    };
    coffee.fork(errorLoggerFile, [ JSON.stringify(options) ])
      .expect('stdout', '')
      .expect('stderr', /ERROR \d+ error foo/)
      .end(err => {
        assert(!err);

        const content = fs.readFileSync(filepath, 'utf8');
        assert.doesNotMatch(content, /WARN \d+ warn foo/);
        assert.match(content, /ERROR \d+ error foo/);
        done();
      });
  });

  it('can set NONE level', done => {
    const options = {
      file: path.join(__dirname, '../../fixtures/tmp/a.log'),
      level: 'NONE',
      consoleLevel: 'NONE',
    };
    coffee.fork(errorLoggerFile, [ JSON.stringify(options) ])
      .expect('stdout', '')
      .expect('stderr', '')
      .end(err => {
        assert(!err);

        assert.strictEqual(fs.readFileSync(filepath, 'utf8'), '');
        done();
      });
  });
});
