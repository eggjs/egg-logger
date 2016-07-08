'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const path = require('path');
const Logger = require('..').EggLogger;
const ContextLogger = require('..').EggContextLogger;

const loggerWithJSON = new Logger({
  file: path.join(__dirname, '../.logs', 'withjson.log'),
  jsonFile: path.join(__dirname, '../.logs', 'withjson.json.log'),
  consoleLevel: 'NONE',
  encoding: 'utf8',
});

const loggerWithoutJSON = new Logger({
  file: path.join(__dirname, '../.logs', 'withoutjson.log'),
  encoding: 'utf8',
  consoleLevel: 'NONE',
});

const ctx = {
  userId: '2088102117755972',
  logonId: 'money02@alitest.com',
  tracer: {
    traceId: 'c0a8016714537221365031005',
  },
  starttime: Date.now(),
  ip: '127.0.0.1',
  method: 'GET',
  url: '/',
};
const contextLogger = new ContextLogger(ctx, loggerWithoutJSON);
const contextLoggerWithJSON = new ContextLogger(ctx, loggerWithJSON);

const err = new Error('test error');
err.data = { foo: 'bar' };
err.code = 'MOCK';

const suite = new Benchmark.Suite();

suite
.add('logger.error(err)', () => {
  loggerWithoutJSON.error(err);
})
.add('logger.info(message)', () => {
  loggerWithoutJSON.info('hello, %s', 'world');
})
.add('logger.write(message)', () => {
  loggerWithoutJSON.write('hello, world');
})
.add('contextLogger.info(message)', () => {
  contextLogger.info('hello, %s', 'world');
})
.add('logger.error(err) with JSON', () => {
  loggerWithJSON.error(err);
})
.add('logger.info(message) with JSON', () => {
  loggerWithJSON.info('hello, %s', 'world');
})
.add('logger.write(message) with JSON', () => {
  loggerWithJSON.write('hello, world');
})
.add('contextLogger.info(message) with JSON', () => {
  contextLoggerWithJSON.info('hello, %s', 'world');
})
.on('cycle', event => {
  benchmarks.add(event.target);
})
.on('start', () => {
  loggerWithJSON.disable('console');
  loggerWithoutJSON.disable('console');
  console.log('\n  node version: %s, date: %s\n  Starting...', process.version, Date());
})
.on('complete', () => {
  benchmarks.log();
  process.exit(0);
})
.run({ async: false });

// node version: v4.4.7, date: Fri Jul 08 2016 23:52:31 GMT+0800 (CST)
//   Starting...
//   8 tests completed.
//
//   logger.error(err)                     x  75,716 ops/sec ±6.78% (68 runs sampled)
//   logger.info(message)                  x 146,234 ops/sec ±5.14% (76 runs sampled)
//   logger.write(message)                 x 321,949 ops/sec ±8.95% (69 runs sampled)
//   contextLogger.info(message)           x  96,073 ops/sec ±11.27% (64 runs sampled)
//   logger.error(err) with JSON           x  32,696 ops/sec ±11.21% (70 runs sampled)
//   logger.info(message) with JSON        x  53,863 ops/sec ±9.74% (64 runs sampled)
//   logger.write(message) with JSON       x 196,964 ops/sec ±4.60% (80 runs sampled)
//   contextLogger.info(message) with JSON x  55,410 ops/sec ±5.81% (78 runs sampled)
