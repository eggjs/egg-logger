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

// node version: v4.4.7, date: Tue Jul 26 2016 00:27:29 GMT+0800 (CST)
// Starting...
// 8 tests completed.
//
// logger.error(err)                     x  29,936 ops/sec ±4.01% (75 runs sampled)
// logger.info(message)                  x 163,694 ops/sec ±4.10% (76 runs sampled)
// logger.write(message)                 x 390,052 ops/sec ±4.74% (76 runs sampled)
// contextLogger.info(message)           x 136,986 ops/sec ±4.74% (78 runs sampled)
// logger.error(err) with JSON           x  13,327 ops/sec ±2.43% (75 runs sampled)
// logger.info(message) with JSON        x  61,547 ops/sec ±11.50% (70 runs sampled)
// logger.write(message) with JSON       x 180,179 ops/sec ±8.81% (67 runs sampled)
// contextLogger.info(message) with JSON x  54,134 ops/sec ±3.59% (76 runs sampled)
