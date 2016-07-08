'use strict';

require('should');
const fs = require('fs');
const path = require('path');
const coffee = require('coffee');
const rimraf = require('rimraf');

describe('test/egg/custom_logger.test.js', () => {
  const loggerFile = path.join(__dirname, '../../fixtures/egg_custom_logger.js');
  const filepath = path.join(__dirname, '../../fixtures/tmp/a.log');

  afterEach(() => {
    rimraf.sync(path.dirname(filepath));
  });

  it('should format work', done => {
    const options = {
      file: filepath,
      level: 'WARN',
    };
    coffee.fork(loggerFile, [ JSON.stringify(options) ])
    .end(() => {
      fs.readFileSync(filepath, 'utf8')
        .should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error foo\n/);
      done();
    });
  });

});
