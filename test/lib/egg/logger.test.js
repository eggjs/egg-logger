'use strict';

const fs = require('fs');
const path = require('path');
const coffee = require('coffee');
const assert = require('assert');
const { rimraf } = require('../../utils');
const levels = require('../../../index');
const Logger = require('../../../index').EggLogger;

describe('test/lib/egg/logger.test.js', () => {
  const loggerFile = path.join(__dirname, '../../fixtures/egg_logger.js');
  const filepath = path.join(__dirname, '../../fixtures/tmp/a.log');

  afterEach(async () => {
    await rimraf(path.dirname(filepath));
  });

  it('should create outputJson .json.log file', done => {
    const options = {
      file: filepath,
      outputJSON: true,
      level: levels.ERROR,
    };
    coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .end(() => {
        assert.match(fs.readFileSync(filepath, 'utf8'),
          /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error foo\n/);
        assert.match(fs.readFileSync(filepath.replace(/\.log$/, '.json.log'), 'utf8'),
          /"message":"error foo"/);
        done();
      });
  });

  it('should only create outputJson .json.log file', done => {
    const file1 = path.join(__dirname, '../../fixtures/tmp/fileOnlyJson.log');
    const options = {
      file: file1,
      outputJSON: true,
      outputJSONOnly: true,
      level: levels.ERROR,
    };
    coffee.fork(loggerFile, [ JSON.stringify(options) ])
      .end(() => {
        assert.match(fs.readFileSync(file1.replace(/\.log$/, '.json.log'), 'utf8'),
          /"message":"error foo"/);
        assert.strictEqual(fs.existsSync(file1), false);
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
      assert.doesNotMatch(content1, /foo/);
      assert.match(content1, /bar/);
      assert.match(content2, /foo/);
      assert.doesNotMatch(content2, /bar/);
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
          assert.match(fs.readFileSync(filepath, 'utf8'),
            /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} ERROR \d+ error foo\n/);
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
          assert.doesNotMatch(content, /DEBUG \d+ debug foo/);
          assert.doesNotMatch(content, /INFO \d+ info foo/);
          assert.doesNotMatch(content, /WARN \d+ warn foo/);
          assert.match(content, /ERROR \d+ error foo/);
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
          assert.doesNotMatch(content, /DEBUG \d+ debug foo/);
          assert.match(content, /INFO \d+ info foo/);
          assert.match(content, /WARN \d+ warn foo/);
          assert.match(content, /ERROR \d+ error foo/);
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
          assert.match(content, /DEBUG \d+ debug foo/);
          assert.match(content, /INFO \d+ info foo/);
          assert.match(content, /WARN \d+ warn foo/);
          assert.match(content, /ERROR \d+ error foo/);
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
          assert.doesNotMatch(content, /DEBUG \d+ debug foo/);
          assert.match(content, /INFO \d+ info foo/);
          assert.match(content, /WARN \d+ warn foo/);
          assert.match(content, /ERROR \d+ error foo/);
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
          assert.doesNotMatch(content, /DEBUG \d+ debug foo/);
          assert.doesNotMatch(content, /INFO \d+ info foo/);
          assert.match(content, /WARN \d+ warn foo/);
          assert.match(content, /ERROR \d+ error foo/);
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
          assert.doesNotMatch(content, /DEBUG \d+ debug foo/);
          assert.doesNotMatch(content, /INFO \d+ info foo/);
          assert.doesNotMatch(content, /WARN \d+ warn foo/);
          assert.match(content, /ERROR \d+ error foo/);
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
          assert.doesNotMatch(content, /DEBUG \d+ debug foo/);
          assert.doesNotMatch(content, /INFO \d+ info foo/);
          assert.doesNotMatch(content, /WARN \d+ warn foo/);
          assert.doesNotMatch(content, /ERROR \d+ error foo/);
          assert.doesNotMatch(content, /write foo/);
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
          assert.doesNotMatch(content, /DEBUG \d+ debug foo/);
          assert.doesNotMatch(content, /INFO \d+ info foo/);
          assert.doesNotMatch(content, /WARN \d+ warn foo/);
          assert.doesNotMatch(content, /ERROR \d+ error foo/);
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

  it('should set level and consoleLevel', async () => {
    const loggerFile = path.join(__dirname, '../../fixtures/egg_logger_dynamically.js');
    const jsonFile = filepath.replace(/\.log$/, '.json.log');
    const options = {
      file: filepath,
      jsonFile,
    };
    await coffee.fork(loggerFile, [ JSON.stringify(options) ])
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
