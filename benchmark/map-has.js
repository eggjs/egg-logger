'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');

const map = new Map();
map.set('a', 1);
map.set('b', 2);
map.set('c', 3);
map.set('d', 4);
map.set('e', 5);

const suite = new Benchmark.Suite();

suite
.add('map.has().get()', () => {
  if (map.has('a')) {
    return map.get('a');
  }
})
.add('map.has()', () => {
  if (map.has('a')) {
    return;
  }
})
.add('map.get()', () => {
  const val = map.get('a');
  if (val) {
    return val;
  }
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

// node version: v4.4.7, date: Fri Jul 08 2016 23:53:40 GMT+0800 (CST)
//   Starting...
//   3 tests completed.
//
//   map.has().get() x 21,385,534 ops/sec ±2.52% (84 runs sampled)
//   map.has()       x 33,696,905 ops/sec ±3.71% (82 runs sampled)
//   map.get()       x 29,315,815 ops/sec ±6.76% (78 runs sampled)
