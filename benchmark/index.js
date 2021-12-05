'use strict';

const { performance } = require('perf_hooks');
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

const ctxUsingPerformance = {
  userId: '2088102117755972',
  logonId: 'money02@alitest.com',
  tracer: {
    traceId: 'c0a8016714537221365031005',
  },
  performanceStarttime: performance.now(),
  ip: '127.0.0.1',
  method: 'GET',
  url: '/',
};
const contextLoggerUsingPerformance = new ContextLogger(ctxUsingPerformance, loggerWithoutJSON);
const contextLoggerWithJSONUsingPerformance = new ContextLogger(ctxUsingPerformance, loggerWithJSON);

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
  .add('performanceStarttime: contextLogger.info(message)', () => {
    contextLoggerUsingPerformance.info('hello, %s', 'world');
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
  .add('performanceStarttime: contextLogger.info(message) with JSON', () => {
    contextLoggerWithJSONUsingPerformance.info('hello, %s', 'world');
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

// node version: v16.13.0, date: Sat Nov 20 2021 14:05:24 GMT+0800 (中国标准时间)
// Starting...
// 10 tests completed.

// logger.error(err)                                           x   378,794 ops/sec ±1.35% (91 runs sampled)
// logger.info(message)                                        x 2,026,394 ops/sec ±1.34% (97 runs sampled)
// logger.write(message)                                       x 7,454,818 ops/sec ±4.36% (86 runs sampled)
// contextLogger.info(message)                                 x 1,266,091 ops/sec ±3.83% (88 runs sampled)
// performanceStarttime: contextLogger.info(message)           x 1,081,355 ops/sec ±3.03% (86 runs sampled)
// logger.error(err) with JSON                                 x   121,808 ops/sec ±2.62% (90 runs sampled)
// logger.info(message) with JSON                              x   513,678 ops/sec ±2.08% (91 runs sampled)
// logger.write(message) with JSON                             x 4,120,955 ops/sec ±2.62% (93 runs sampled)
// contextLogger.info(message) with JSON                       x   420,963 ops/sec ±3.39% (88 runs sampled)
// performanceStarttime: contextLogger.info(message) with JSON x   382,180 ops/sec ±3.46% (88 runs sampled)

// node version: v14.18.1, date: Sat Nov 20 2021 14:10:56 GMT+0800 (中国标准时间)
// Starting...
// 10 tests completed.

// logger.error(err)                                           x   283,941 ops/sec ±0.93% (95 runs sampled)
// logger.info(message)                                        x 1,204,237 ops/sec ±0.58% (92 runs sampled)
// logger.write(message)                                       x 5,056,509 ops/sec ±0.69% (92 runs sampled)
// contextLogger.info(message)                                 x   886,979 ops/sec ±1.05% (93 runs sampled)
// performanceStarttime: contextLogger.info(message)           x   635,255 ops/sec ±1.34% (92 runs sampled)
// logger.error(err) with JSON                                 x    93,043 ops/sec ±1.12% (91 runs sampled)
// logger.info(message) with JSON                              x   329,611 ops/sec ±0.88% (92 runs sampled)
// logger.write(message) with JSON                             x 2,483,464 ops/sec ±3.14% (87 runs sampled)
// contextLogger.info(message) with JSON                       x   308,370 ops/sec ±3.17% (83 runs sampled)
// performanceStarttime: contextLogger.info(message) with JSON x   282,286 ops/sec ±1.34% (93 runs sampled)

// node version: v12.22.7, date: Sat Nov 20 2021 14:09:42 GMT+0800 (GMT+08:00)
// Starting...
// 10 tests completed.

// logger.error(err)                                           x   291,964 ops/sec ±0.81% (94 runs sampled)
// logger.info(message)                                        x 1,314,201 ops/sec ±0.93% (92 runs sampled)
// logger.write(message)                                       x 5,628,384 ops/sec ±0.79% (94 runs sampled)
// contextLogger.info(message)                                 x   900,788 ops/sec ±1.42% (89 runs sampled)
// performanceStarttime: contextLogger.info(message)           x   669,698 ops/sec ±1.50% (89 runs sampled)
// logger.error(err) with JSON                                 x    97,022 ops/sec ±1.57% (88 runs sampled)
// logger.info(message) with JSON                              x   357,988 ops/sec ±1.03% (91 runs sampled)
// logger.write(message) with JSON                             x 2,917,091 ops/sec ±1.10% (87 runs sampled)
// contextLogger.info(message) with JSON                       x   341,035 ops/sec ±1.62% (91 runs sampled)
// performanceStarttime: contextLogger.info(message) with JSON x   295,930 ops/sec ±1.42% (90 runs sampled)

// node version: v10.24.1, date: Sat Nov 20 2021 14:08:19 GMT+0800 (GMT+08:00)
// Starting...
// 10 tests completed.

// logger.error(err)                                           x   184,461 ops/sec ±5.58% (82 runs sampled)
// logger.info(message)                                        x 1,279,248 ops/sec ±2.01% (83 runs sampled)
// logger.write(message)                                       x 5,638,776 ops/sec ±1.52% (80 runs sampled)
// contextLogger.info(message)                                 x   845,329 ops/sec ±1.60% (81 runs sampled)
// performanceStarttime: contextLogger.info(message)           x   662,304 ops/sec ±2.72% (82 runs sampled)
// logger.error(err) with JSON                                 x    67,005 ops/sec ±2.26% (81 runs sampled)
// logger.info(message) with JSON                              x   344,886 ops/sec ±1.85% (89 runs sampled)
// logger.write(message) with JSON                             x 2,864,012 ops/sec ±1.66% (86 runs sampled)
// contextLogger.info(message) with JSON                       x   254,776 ops/sec ±1.71% (89 runs sampled)
// performanceStarttime: contextLogger.info(message) with JSON x   229,181 ops/sec ±1.62% (89 runs sampled)

// node version: v8.17.0, date: Sat Nov 20 2021 14:06:59 GMT+0800 (CST)
// Starting...
// 10 tests completed.

// logger.error(err)                                           x   173,509 ops/sec ±2.36% (78 runs sampled)
// logger.info(message)                                        x 1,418,705 ops/sec ±2.04% (90 runs sampled)
// logger.write(message)                                       x 4,905,138 ops/sec ±1.46% (93 runs sampled)
// contextLogger.info(message)                                 x   945,955 ops/sec ±3.21% (85 runs sampled)
// performanceStarttime: contextLogger.info(message)           x   740,081 ops/sec ±3.33% (83 runs sampled)
// logger.error(err) with JSON                                 x    68,264 ops/sec ±2.70% (81 runs sampled)
// logger.info(message) with JSON                              x   371,275 ops/sec ±2.79% (90 runs sampled)
// logger.write(message) with JSON                             x 2,497,323 ops/sec ±5.17% (81 runs sampled)
// contextLogger.info(message) with JSON                       x   260,842 ops/sec ±3.12% (85 runs sampled)
// performanceStarttime: contextLogger.info(message) with JSON x   226,953 ops/sec ±3.58% (82 runs sampled)

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
