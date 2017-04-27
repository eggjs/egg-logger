'use strict';

require('should');
const fs = require('fs');
const path = require('path');
const coffee = require('coffee');
const rimraf = require('rimraf');
const assert = require('assert');
const levels = require('../../../index');
const Logger = require('../../../index').EggLogger;

describe('test/egg/logger.test.js', () => {
  const loggerFile = path.join(__dirname, '../../fixtures/egg_logger.js');
  const filepath = path.join(__dirname, '../../fixtures/tmp/a.log');

  afterEach(() => {
    rimraf.sync(path.dirname(filepath));
  });

  it('should create outputJson .json.log file', done => {
    const options = {
      file: filepath,
      outputJSON: true,
      level: levels.ERROR,
    };
    coffee.fork(loggerFile, [ JSON.stringify(options) ])
    .end(() => {
      fs.readFileSync(filepath, 'utf8')
        .should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error foo\n/);
      fs.readFileSync(filepath.replace(/\.log$/, '.json.log'), 'utf8')
        .should.match(/"message":"error foo"/);
      done();
    });
  });

  it('should un-redirect specific level to logger', done => {
    const file1 = path.join(__dirname, '../../fixtures/tmp/file1.log');
    const file2 = path.join(__dirname, '../../fixtures/tmp/file2.log');
    const logger1 = new Logger({
      file: file1,
      buffer: false,
    });
    const logger2 = new Logger({
      file: file2,
      buffer: false,
    });

    logger1.redirect('warn', logger2);
    logger1.redirect('error', logger2);
    logger1.unredirect('error');
    logger1.warn('foo');
    logger1.error('bar');

    setTimeout(() => {
      const content1 = fs.readFileSync(file1, 'utf8');
      const content2 = fs.readFileSync(file2, 'utf8');
      content1.should.not.match(/foo/);
      content1.should.match(/bar/);
      content2.should.match(/foo/);
      content2.should.not.match(/bar/);
      done();
    }, 100);
  });

  describe('level', () => {

    it('normal format', done => {
      const options = {
        file: filepath,
        level: levels.ERROR,
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .end(() => {
        fs.readFileSync(filepath, 'utf8')
          .should.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error foo\n/);
        done();
      });
    });

    it('can set level = levels.ERROR', done => {
      const options = {
        file: filepath,
        level: levels.ERROR,
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .end(function() {
        const content = fs.readFileSync(filepath, 'utf8');
        content.should.not.match(/DEBUG \d+ debug foo/);
        content.should.not.match(/INFO \d+ info foo/);
        content.should.not.match(/WARN \d+ warn foo/);
        content.should.match(/ERROR \d+ error foo/);
        done();
      });
    });

    it('default level is info', done => {
      const options = {
        file: filepath,
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .end(function() {
        const content = fs.readFileSync(filepath, 'utf8');
        content.should.not.match(/DEBUG \d+ debug foo/);
        content.should.match(/INFO \d+ info foo/);
        content.should.match(/WARN \d+ warn foo/);
        content.should.match(/ERROR \d+ error foo/);
        done();
      });
    });

    it('should log all level when level = debug', done => {
      const options = {
        file: filepath,
        level: 'debug',
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .end(function() {
        const content = fs.readFileSync(filepath, 'utf8');
        content.should.match(/DEBUG \d+ debug foo/);
        content.should.match(/INFO \d+ info foo/);
        content.should.match(/WARN \d+ warn foo/);
        content.should.match(/ERROR \d+ error foo/);
        done();
      });
    });

    it('should log info, warn and error when level = info', done => {
      const options = {
        file: filepath,
        level: 'info',
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .end(function() {
        const content = fs.readFileSync(filepath, 'utf8');
        content.should.not.match(/DEBUG \d+ debug foo/);
        content.should.match(/INFO \d+ info foo/);
        content.should.match(/WARN \d+ warn foo/);
        content.should.match(/ERROR \d+ error foo/);
        done();
      });
    });

    it('should log warn and error when level = warn', done => {
      const options = {
        file: filepath,
        level: 'warn',
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .end(function() {
        const content = fs.readFileSync(filepath, 'utf8');
        content.should.not.match(/DEBUG \d+ debug foo/);
        content.should.not.match(/INFO \d+ info foo/);
        content.should.match(/WARN \d+ warn foo/);
        content.should.match(/ERROR \d+ error foo/);
        done();
      });
    });

    it('should log error only when level = error', done => {
      const options = {
        file: filepath,
        level: 'error',
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .end(function() {
        const content = fs.readFileSync(filepath, 'utf8');
        content.should.not.match(/DEBUG \d+ debug foo/);
        content.should.not.match(/INFO \d+ info foo/);
        content.should.not.match(/WARN \d+ warn foo/);
        content.should.match(/ERROR \d+ error foo/);
        done();
      });
    });

    it('should log nothing when level = none', done => {
      const options = {
        file: filepath,
        level: 'none',
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .end(function() {
        const content = fs.readFileSync(filepath, 'utf8');
        content.should.not.match(/DEBUG \d+ debug foo/);
        content.should.not.match(/INFO \d+ info foo/);
        content.should.not.match(/WARN \d+ warn foo/);
        content.should.not.match(/ERROR \d+ error foo/);
        content.should.not.match(/write foo/);
        done();
      });
    });

    it('should support level = NONE', done => {
      const options = {
        file: filepath,
        level: 'NONE',
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .end(function() {
        const content = fs.readFileSync(filepath, 'utf8');
        content.should.not.match(/DEBUG \d+ debug foo/);
        content.should.not.match(/INFO \d+ info foo/);
        content.should.not.match(/WARN \d+ warn foo/);
        content.should.not.match(/ERROR \d+ error foo/);
        done();
      });
    });
  });

  describe('consoleLevel', () => {

    it('normal', done => {
      const options = {
        file: filepath,
        level: 'NONE',
        consoleLevel: levels.ERROR,
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .expect('stderr', /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error foo\n/)
      .end(done);
    });

    it('can set consoleLevel = levels.ERROR', done => {
      const options = {
        file: filepath,
        level: 'NONE',
        consoleLevel: levels.ERROR,
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .expect('stdout', 'write foo\n')
      .expect('stderr', /ERROR \d+ error foo/)
      .end(done);
    });

    it('consoleLevel default is NONE', done => {
      const options = {
        file: filepath,
        level: 'NONE',
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .expect('stdout', '')
      .expect('stderr', '')
      .end(done);
    });

    it('should log all when consoleLevel = info', done => {
      const options = {
        file: filepath,
        level: 'NONE',
        consoleLevel: 'debug',
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .expect('stdout', /DEBUG \d+ debug foo/)
      .expect('stdout', /INFO \d+ info foo/)
      .expect('stdout', /WARN \d+ warn foo/)
      .notExpect('stdout', /ERROR \d+ error foo/)
      .expect('stderr', /ERROR \d+ error foo/)
      .end(done);
    });

    it('should log info, warn and error when consoleLevel = info', done => {
      const options = {
        file: filepath,
        level: 'NONE',
        consoleLevel: 'info',
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .notExpect('stdout', /DEBUG \d+ debug foo/)
      .expect('stdout', /INFO \d+ info foo/)
      .expect('stdout', /WARN \d+ warn foo/)
      .notExpect('stdout', /ERROR \d+ error foo/)
      .expect('stderr', /ERROR \d+ error foo/)
      .end(done);
    });

    it('should log warn and error when consoleLevel = warn', done => {
      const options = {
        file: filepath,
        level: 'NONE',
        consoleLevel: 'warn',
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .notExpect('stdout', /DEBUG \d+ debug foo/)
      .notExpect('stdout', /INFO \d+ info foo/)
      .expect('stdout', /WARN \d+ warn foo/)
      .notExpect('stdout', /ERROR \d+ error foo/)
      .expect('stderr', /ERROR \d+ error foo/)
      .end(done);
    });

    it('should log error when level = error', done => {
      const options = {
        file: filepath,
        level: 'NONE',
        consoleLevel: 'error',
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .expect('stdout', 'write foo\n')
      .expect('stderr', /ERROR \d+ error foo/)
      .end(done);
    });

    it('should log nothing when consoleLevel = none', done => {
      const options = {
        file: filepath,
        level: 'NONE',
        consoleLevel: 'NONE',
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .expect('stdout', '')
      .expect('stderr', '')
      .end(done);
    });

    it('can set consoleLevel = none', done => {
      const options = {
        file: filepath,
        level: 'NONE',
        consoleLevel: 'none',
      };
      coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .expect('stdout', '')
      .expect('stderr', '')
      .end(done);
    });
  });

  it('should set level and consoleLevel', function* () {
    const loggerFile = path.join(__dirname, '../../fixtures/egg_logger_dynamically.js');
    const jsonFile = filepath.replace(/\.log$/, '.json.log');
    const options = {
      file: filepath,
      jsonFile,
    };
    yield coffee.fork(loggerFile, [ JSON.stringify(options) ])
    .debug()
    .expect('stdout', /INFO \d+ info foo/)
    .expect('stdout', /WARN \d+ warn foo/)
    .expect('stdout', /INFO \d+ info foo after level changed/)
    .expect('stdout', /WARN \d+ warn foo after level changed/)
    .expect('stdout', /logger level WARN/)
    .notExpect('stdout', /INFO \d+ info foo after consoleLevel changed/)
    .expect('stdout', /WARN \d+ warn foo after consoleLevel changed/)
    .expect('stdout', /logger consoleLevel WARN/)
    .end();

    let content = fs.readFileSync(filepath, 'utf8');
    assert(/INFO \d+ info foo/.test(content));
    assert(/WARN \d+ warn foo/.test(content));
    assert(!/INFO \d+ info foo after level changed/.test(content));
    assert(/WARN \d+ warn foo after level changed/.test(content));
    assert(/logger level WARN/.test(content));
    assert(!/INFO \d+ info foo after consoleLevel changed/.test(content));
    assert(/WARN \d+ warn foo after consoleLevel changed/.test(content));
    assert(/logger consoleLevel WARN/.test(content));

    content = fs.readFileSync(jsonFile, 'utf8');
    assert(/"message":"info foo"/.test(content));
    assert(/"message":"warn foo"/.test(content));
    assert(!/"message":"info foo after level changed"/.test(content));
    assert(/"message":"warn foo after level changed"/.test(content));
    assert(/"message":"logger level WARN"/.test(content));
    assert(!/"message":"info foo after consoleLevel changed"/.test(content));
    assert(/"message":"warn foo after consoleLevel changed"/.test(content));
    assert(/"message":"logger level WARN"/.test(content));
  });
});
