'use strict';
const fs = require('fs');
const path = require('path');
const coffee = require('coffee');
const rimraf = require('rimraf');
const levels = require('../../').levels;

describe('test/lib/ts.test.js', () => {
  const tmpFolder = path.join(__dirname, '../fixtures/tmp');
  const loggerFile = path.join(__dirname, '../fixtures/egg_ts_logger.ts');
  const filepath = path.join(__dirname, '../fixtures/tmp/b.log');
  const customPath = path.join(__dirname, '../fixtures/tmp/c.log');
  const appLogName = 'app-web.log';
  const coreLogName = 'egg-web.log';
  const agentLogName = 'egg-agent.log';
  const errorLogName = 'common-error.log';
  const appLogPath = path.join(tmpFolder, appLogName);
  const coreLogPath = path.join(tmpFolder, coreLogName);
  const errorLogPath = path.join(tmpFolder, errorLogName);

  afterEach(() => {
    rimraf.sync(path.dirname(filepath));
  });

  it('should work with ts without error', done => {
    const options = {
      file: filepath,
      level: levels.ALL,
      customFile: customPath,
    };

    const eggLoggersOptions = {
      logger: {
        type: 'application',
        consoleLevel: 'INFO',
        dir: tmpFolder,
        appLogName,
        coreLogName,
        agentLogName,
        errorLogName,
        buffer: false,
        concentrateError: 'duplicate',
      },
      customLogger: {
        aLogger: {
          consoleLevel: 'INFO',
          file: customPath,
        },
      },
    };

    coffee.fork(loggerFile, [ JSON.stringify(options), JSON.stringify(eggLoggersOptions) ], {
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

        content = fs.readFileSync(appLogPath, 'utf8');
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} INFO \d+ info logger\n/);
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} WARN \d+ warn logger\n/);
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error logger\n/);

        content = fs.readFileSync(coreLogPath, 'utf8');
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} INFO \d+ info coreLogger\n/);
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} WARN \d+ warn coreLogger\n/);
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error coreLogger\n/);

        content = fs.readFileSync(errorLogPath, 'utf8');
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error errorLogger\n/);
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error logger\n/);
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error coreLogger\n/);
        content.should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error aLogger\n/);
        done();
      });
  });
});
