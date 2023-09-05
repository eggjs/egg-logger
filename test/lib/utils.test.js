const assert = require('assert');
const { formatError } = require('../../lib/utils');

const NODE_MAJOR_VERSION = Number(process.version.split('.')[0].substring(1));

describe('test/lib/utils.test.js', () => {
  if (NODE_MAJOR_VERSION < 16) return;

  describe('formatError', () => {
    it('should format with no cause', () => {
      const rootError = new Error('root error');
      // nodejs.Error: root error
      //     at Context.<anonymous> (egg-logger/test/lib/utils.test.js:6:25)
      //     at callFn (egg-logger/node_modules/mocha/lib/runnable.js:366:21)
      //     at Runnable.run (egg-logger/node_modules/mocha/lib/runnable.js:354:5)
      //     at Runner.runTest (egg-logger/node_modules/mocha/lib/runner.js:666:10)
      //     at egg-logger/node_modules/mocha/lib/runner.js:789:12
      //     at next (egg-logger/node_modules/mocha/lib/runner.js:581:14)
      //     at egg-logger/node_modules/mocha/lib/runner.js:591:7
      //     at next (egg-logger/node_modules/mocha/lib/runner.js:474:14)
      //     at Immediate._onImmediate (egg-logger/node_modules/mocha/lib/runner.js:559:5)
      //     at process.processImmediate (node:internal/timers:476:21)
      //
      // pid: 70929
      // hostname: xxx
      const msg = formatError(rootError);
      assert(msg.match(/nodejs.Error: root error/));
      assert(msg.match(/pid: /));
      assert(msg.match(/hostname: /));
    });

    it('should format with cause', () => {
      const rootError = new Error('root error');
      const error = new Error('mock error', {
        cause: rootError,
      });
      // nodejs.Error: mock error
      //     at Context.<anonymous> (egg-logger/test/lib/utils.test.js:30:21)
      //     at callFn (egg-logger/node_modules/mocha/lib/runnable.js:366:21)
      //     at Runnable.run (egg-logger/node_modules/mocha/lib/runnable.js:354:5)
      //     at Runner.runTest (egg-logger/node_modules/mocha/lib/runner.js:666:10)
      //     at egg-logger/node_modules/mocha/lib/runner.js:789:12
      //     at next (egg-logger/node_modules/mocha/lib/runner.js:581:14)
      //     at egg-logger/node_modules/mocha/lib/runner.js:591:7
      //     at next (egg-logger/node_modules/mocha/lib/runner.js:474:14)
      //     at Immediate._onImmediate (egg-logger/node_modules/mocha/lib/runner.js:559:5)
      //     at process.processImmediate (node:internal/timers:476:21)
      //
      // cause:
      //
      // nodejs.Error: root error
      //     at Context.<anonymous> (egg-logger/test/lib/utils.test.js:29:25)
      //     at callFn (egg-logger/node_modules/mocha/lib/runnable.js:366:21)
      //     at Runnable.run (egg-logger/node_modules/mocha/lib/runnable.js:354:5)
      //     at Runner.runTest (egg-logger/node_modules/mocha/lib/runner.js:666:10)
      //     at egg-logger/node_modules/mocha/lib/runner.js:789:12
      //     at next (egg-logger/node_modules/mocha/lib/runner.js:581:14)
      //     at egg-logger/node_modules/mocha/lib/runner.js:591:7
      //     at next (egg-logger/node_modules/mocha/lib/runner.js:474:14)
      //     at Immediate._onImmediate (egg-logger/node_modules/mocha/lib/runner.js:559:5)
      //     at process.processImmediate (node:internal/timers:476:21)
      //
      // pid: 70929
      // hostname: xxxx
      const msg = formatError(error);
      assert(msg.match(/nodejs.Error: mock error/));
      assert(msg.match(/cause:/));
      assert(msg.match(/nodejs.Error: root error/));
      assert(msg.match(/pid: /));
      assert(msg.match(/hostname: /));
    });

    it('should format with cause recursive', () => {
      const rootError = new Error('root error');
      const error = new Error('mock error', {
        cause: rootError,
      });
      Object.defineProperty(rootError, 'cause', {
        value: error,
        enumerable: false,
      });
      // nodejs.Error: mock error
      // ...
      //
      // cause:
      //
      // nodejs.Error: root error
      // ...
      //
      // cause:
      //
      // nodejs.Error: mock error
      // ...
      //
      // cause:
      //
      // nodejs.Error: root error
      // ...
      //
      // cause:
      //
      // nodejs.Error: mock error
      // ...
      //
      // cause:
      //
      // nodejs.Error: root error
      // ...
      //
      // cause:
      //
      // nodejs.Error: mock error
      // ...
      //
      // cause:
      //
      // nodejs.Error: root error
      // ...
      //
      // cause:
      //
      // nodejs.Error: mock error
      // ...
      //
      // cause:
      //
      // nodejs.Error: root error
      // ...
      //
      // cause:
      //
      // nodejs.Error: mock error
      // ...
      //
      // cause:
      //
      // too long cause chain
      // pid: 70929
      // hostname: xxxx
      const msg = formatError(error);
      assert(msg.match(/nodejs.Error: mock error/));
      assert(msg.match(/cause:/));
      assert(msg.match(/nodejs.Error: root error/));
      assert(msg.match(/too long cause chain/));
      assert(msg.match(/pid: /));
      assert(msg.match(/hostname: /));
    });
  });
});
