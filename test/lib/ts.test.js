'use strict';
const fs = require('fs');
const path = require('path');
const coffee = require('coffee');
const rimraf = require('rimraf');
const levels = require('../../').levels;

describe('test/lib/ts.test.js', () => {
  const loggerFile = path.join(__dirname, '../fixtures/egg_ts_logger.ts');
  const filepath = path.join(__dirname, '../fixtures/tmp/b.log');

  afterEach(() => {
    rimraf.sync(path.dirname(filepath));
  });

  it('should work with ts without error', done => {
    const options = {
      file: filepath,
      level: levels.ALL,
    };

    coffee.fork(loggerFile, [ JSON.stringify(options) ], {
      execArgv: [ '--require', require.resolve('ts-node/register/type-check') ],
    })
      .end(() => {
        const content = fs.readFileSync(filepath, 'utf8');
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} INFO \d+ info foo\n/);
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} WARN \d+ warn foo\n/);
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error foo\n/);
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} INFO \d+ LoggerLevel ALL,DEBUG,INFO,WARN,ERROR,NONE/);
        done();
      });
  });
});
