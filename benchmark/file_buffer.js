'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const path = require('path');
const FileBufferTransport = require('..').FileBufferTransport;
const Logger = require('..').Logger;

const logger = new Logger();
const transport = new FileBufferTransport({
  file: path.join(__dirname, '../.logs/file_buffer_benchmark.log'),
  level: 'INFO',
});
logger.set('file', transport);
logger.info('info start');

const suite = new Benchmark.Suite();

suite
.add('without arguments', () => {
  logger.info('info without arguments and message is litte bit long ........ hahah');
})
.add('with arguments', () => {
  logger.info('info %s %s %s %s %d %s', 'a', 'bbbb', 'ccccc', 'ddddd', 123123, 'this is long string mmmmmmm');
})
.add('with json', () => {
  logger.info('info this is json %j', { a: 'a', b: 'bbbb', c: 'ccccc', d: 'ddddd', e: 123123, f: 'this is long string mmmmmmm' });
})

.on('cycle', event => {
  benchmarks.add(event.target);
})
.on('start', () => {
  console.log('\n  node version: %s, date: %s\n  Starting...', process.version, Date());
})
.on('complete', () => {
  benchmarks.log();
  setTimeout(() => process.exit(0), 5000);
})
.run({ async: false });

// node version: v7.2.1, date: Thu Dec 08 2016 14:00:19 GMT+0800 (CST)
//   Starting...
//   3 tests completed.
//
//   without arguments x 778,145 ops/sec ±7.37% (76 runs sampled)
//   with arguments    x 376,776 ops/sec ±3.97% (71 runs sampled)
//   with json         x 337,811 ops/sec ±2.79% (79 runs sampled)
//
// node version: v6.9.2, date: Thu Dec 08 2016 14:00:50 GMT+0800 (CST)
//   Starting...
//   3 tests completed.
//
//   without arguments x 994,857 ops/sec ±2.13% (81 runs sampled)
//   with arguments    x 437,019 ops/sec ±2.87% (66 runs sampled)
//   with json         x 367,269 ops/sec ±3.80% (80 runs sampled)
//
// node version: v4.7.0, date: Thu Dec 08 2016 14:01:14 GMT+0800 (CST)
//   Starting...
//   3 tests completed.
//
//   without arguments x 672,514 ops/sec ±5.03% (77 runs sampled)
//   with arguments    x 426,848 ops/sec ±5.14% (76 runs sampled)
//   with json         x 289,842 ops/sec ±4.25% (77 runs sampled)
