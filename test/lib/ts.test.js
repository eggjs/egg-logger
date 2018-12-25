'use strict';
const fs = require('fs');
const path = require('path');
const coffee = require('coffee');
const rimraf = require('rimraf');
const levels = require('../../').levels;

describe('test/lib/ts.test.js', () => {
  const loggerFile = path.join(__dirname, '../fixtures/egg_ts_logger.ts');
  const filepath = path.join(__dirname, '../fixtures/tmp/b.log');
  const customPath = path.join(__dirname, '../fixtures/tmp/c.log');

  afterEach(() => {
    rimraf.sync(path.dirname(filepath));
  });

  it('should work with ts without error', done => {
    const options = {
      file: filepath,
      level: levels.ALL,
      customFile: customPath,
    };

    coffee.fork(loggerFile, [ JSON.stringify(options) ], {
      env: Object.assign({}, process.env, { TS_NODE_PROJECT: path.resolve(__dirname, '../fixtures/tsconfig.json') }),
      execArgv: [ '--require', require.resolve('ts-node/register/type-check') ],
    })
      // .debug()
      .expect('code', 0)
      .end(() => {
        let content = fs.readFileSync(filepath, 'utf8');
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} INFO \d+ info foo\n/);
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} WARN \d+ warn foo\n/);
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error foo\n/);
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} INFO \d+ LoggerLevel ALL,DEBUG,INFO,WARN,ERROR,NONE/);

        content = fs.readFileSync(customPath, 'utf8');
        content.should.match(/info foo\n/);
        content.should.match(/warn foo\n/);
        content.should.match(/error foo\n/);
        content.should.match(/LoggerLevel ALL,DEBUG,INFO,WARN,ERROR,NONE/);
        done();
      });
  });
});
