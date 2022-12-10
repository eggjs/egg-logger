'use strict';

const assert = require('assert');
const { readFile } = require('fs/promises');
const path = require('path');
const coffee = require('coffee');
const { rimraf } = require('../../utils');

describe('test/lib/egg/custom_logger.test.js', () => {
  const loggerFile = path.join(__dirname, '../../fixtures/egg_custom_logger.js');
  const tmpDir = path.join(__dirname, '../../fixtures/tmp');
  const filePath = path.join(tmpDir, '/a.log');

  beforeEach(() => rimraf(path.dirname(filePath)));
  afterEach(() => rimraf(path.dirname(filePath)));

  it('should format work', async () => {
    const options = {
      file: filePath,
      level: 'WARN',
    };
    await coffee.fork(loggerFile, [ JSON.stringify(options) ]).end();
    const log = await readFile(filePath, 'utf-8');
    assert(log.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error foo\n/));
  });

  it('should support relative path', async () => {
    const options = {
      dir: tmpDir,
      file: 'relative.log',
      level: 'WARN',
    };
    await coffee.fork(loggerFile, [ JSON.stringify(options) ]).end();

    const log = await readFile(path.join(tmpDir, options.file), 'utf-8');
    assert(log.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error foo\n/));
  });
});
