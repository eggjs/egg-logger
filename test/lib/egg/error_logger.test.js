'use strict';

const should = require('should');
const fs = require('fs');
const path = require('path');
const coffee = require('coffee');
const rimraf = require('rimraf');
const EggErrorLogger = require('../../../index').EggErrorLogger;
const levels = require('../../../index');
const utils = require('../../../lib/utils');

describe('test/egg/error_logger.test.js', () => {
  const errorLoggerFile = path.join(__dirname, '../../fixtures/egg_error_logger.js');
  const filepath = path.join(__dirname, '../../fixtures/tmp/a.log');

  afterEach(() => {
    rimraf.sync(path.dirname(filepath));
  });

  it('default params', () => {
    const logger = new EggErrorLogger({
      file: filepath,
    });
    logger.options.should.eql({
      buffer: true,
      file: filepath,
      encoding: 'utf8',
      level: levels.ERROR,
      consoleLevel: levels.ERROR,
      jsonFile: '',
      outputJSON: false,
      formatter: utils.defaultFormatter,
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
      should.not.exists(err);

      const content = fs.readFileSync(filepath, 'utf8');
      content.should.not.match(/WARN \d+ warn foo/);
      content.should.match(/ERROR \d+ error foo/);
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
      should.not.exists(err);

      const content = fs.readFileSync(filepath, 'utf8');
      content.should.not.match(/WARN \d+ warn foo/);
      content.should.match(/ERROR \d+ error foo/);
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
      should.not.exists(err);

      fs.readFileSync(filepath, 'utf8').should.eql('');
      done();
    });
  });
});
