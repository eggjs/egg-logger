'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const util = require('util');

function write(msg) {
  return msg;
}

function writeFormat(msg) {
  // support util.format
  if (arguments.length > 1) msg = util.format.apply(util, arguments);
  return msg;
}

const suite = new Benchmark.Suite();

suite
.add('write(msg)', () => {
  write('hello');
})
.add('writeFormat(msg)', () => {
  writeFormat('hello');
})
.add('writeFormat(msg, args)', () => {
  writeFormat('hello %s', 'world');
})
.on('cycle', event => {
  benchmarks.add(event.target);
})
.on('start', () => {
  console.log('\n  node version: %s, date: %s\n  Starting...', process.version, Date());
})
.on('complete', () => {
  benchmarks.log();
  process.exit(0);
})
.run({ async: false });

// node version: v4.4.7, date: Wed Nov 02 2016 12:19:33 GMT+0800 (CST)
// Starting...
// 3 tests completed.
//
// write(msg)             x 82,009,828 ops/sec ±3.46% (76 runs sampled)
// writeFormat(msg)       x 84,779,839 ops/sec ±3.70% (82 runs sampled)
// writeFormat(msg, args) x  1,585,188 ops/sec ±1.27% (84 runs sampled)
