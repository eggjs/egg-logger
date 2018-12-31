'use strict';

const assert = require('assert');
const { fs } = require('mz');
const path = require('path');
const coffee = require('coffee');
const { rimraf } = require('mz-modules');

describe('test/egg/custom_logger.test.js', () => {
  const loggerFile = path.join(__dirname, '../../fixtures/egg_custom_logger.js');
  const tmpDir = path.join(__dirname, '../../fixtures/tmp');
  const filePath = path.join(tmpDir, '/a.log');

  beforeEach(() => rimraf(path.dirname(filePath)));
  afterEach(() => rimraf(path.dirname(filePath)));

  it('should format work', function*() {
    const options = {
      file: filePath,
      level: 'WARN',
    };
    yield coffee.fork(loggerFile, [ JSON.stringify(options) ]).end();
    const log = yield fs.readFile(filePath, 'utf-8');
    assert(log.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error foo\n/));
  });

  it('should support relative path', function* () {
    const options = {
      dir: tmpDir,
      file: 'relative.log',
      level: 'WARN',
    };
    yield coffee.fork(loggerFile, [ JSON.stringify(options) ]).end();

    const log = yield fs.readFile(path.join(tmpDir, options.file), 'utf-8');
    assert(log.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error foo\n/));
  });
});
