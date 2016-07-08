'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');

const map = new Map();
for (let i = 0, l = 5; i < l; i++) {
  map.set(i.toString(), i);
}

const obj = {};
for (let i = 0, l = 5; i < l; i++) {
  obj[i.toString()] = i;
}

const suite = new Benchmark.Suite();

suite
.add('map.values()', () => {
  const arr = [];
  for (const val of map.values()) {
    arr.push(val);
  }
})
.add('obj for in', () => {
  const arr = [];
  for (const key in obj) {
    arr.push(obj[key]);
  }
})
.add('Object.keys', () => {
  const arr = [];
  const keys = Object.keys(obj);
  for (let i = 0, l = keys.length; i < l; i++) {
    arr.push(obj[keys[i]]);
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

// node version: v4.4.7, date: Fri Jul 08 2016 23:54:36 GMT+0800 (CST)
//   Starting...
//   3 tests completed.
//
//   map.values() x   794,226 ops/sec ±7.04% (78 runs sampled)
//   obj for in   x   539,445 ops/sec ±2.08% (86 runs sampled)
//   Object.keys  x 2,064,693 ops/sec ±1.35% (86 runs sampled)
