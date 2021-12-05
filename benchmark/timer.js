'use strict';

const { performance } = require('perf_hooks');
const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');

function DateTimer(starttime) {
  return Date.now() - starttime;
}

function PerformanceTimer(starttime) {
  return performance.now() - starttime;
}

function PerformanceTimerFixedString(starttime) {
  return (performance.now() - starttime).toFixed(3);
}

function PerformanceTimerMicrosecond(starttime) {
  return Math.floor((performance.now() - starttime) * 1000);
}

function PerformanceTimerMillisecond(starttime) {
  return Math.floor((performance.now() - starttime) * 1000) / 1000;
}

const suite = new Benchmark.Suite();

const dateNowStarttime = Date.now();
const performanceNowStarttime = performance.now();

suite
  .add('DateTimer()', () => {
    DateTimer(dateNowStarttime);
  })
  .add('PerformanceTimer()', () => {
    PerformanceTimer(performanceNowStarttime);
  })
  .add('PerformanceTimerFixedString()', () => {
    PerformanceTimerFixedString(performanceNowStarttime);
  })
  .add('PerformanceTimerMicrosecond()', () => {
    PerformanceTimerMicrosecond(performanceNowStarttime);
  })
  .add('PerformanceTimerMillisecond()', () => {
    PerformanceTimerMillisecond(performanceNowStarttime);
  })
  .on('cycle', event => {
    benchmarks.add(event.target);
  })
  .on('start', () => {
    console.log('\n  node version: %s, date: %s\n  Starting...', process.version, Date());
    console.log('  DateTimer(dateNowStarttime) %sms',
      DateTimer(dateNowStarttime));
    console.log('  PerformanceTimer(performanceNowStarttime) %sms',
      PerformanceTimer(performanceNowStarttime));
    console.log('  PerformanceTimerFixedString(performanceNowStarttime) %sms',
      PerformanceTimerFixedString(performanceNowStarttime));
    console.log('  PerformanceTimerMicrosecond(performanceNowStarttime) %sμs',
      PerformanceTimerMicrosecond(performanceNowStarttime));
    console.log('  PerformanceTimerMillisecond(performanceNowStarttime) %sms',
      PerformanceTimerMillisecond(performanceNowStarttime));
  })
  .on('complete', () => {
    benchmarks.log();
    process.exit(0);
  })
  .run({ async: false });

// node version: v16.13.0, date: Sat Nov 20 2021 14:01:59 GMT+0800 (中国标准时间)
// Starting...
// DateTimer(dateNowStarttime) 3ms
// PerformanceTimer(performanceNowStarttime) 3.4372918605804443ms
// PerformanceTimerFixedString(performanceNowStarttime) 3.467ms
// PerformanceTimerMicrosecond(performanceNowStarttime) 3592μs
// PerformanceTimerMillisecond(performanceNowStarttime) 3.62ms
// 5 tests completed.

// DateTimer()                   x 29,062,254 ops/sec ±0.22% (98 runs sampled)
// PerformanceTimer()            x 47,283,718 ops/sec ±0.07% (96 runs sampled)
// PerformanceTimerFixedString() x  7,022,557 ops/sec ±0.15% (94 runs sampled)
// PerformanceTimerMicrosecond() x 35,585,959 ops/sec ±0.09% (101 runs sampled)
// PerformanceTimerMillisecond() x 25,969,450 ops/sec ±0.07% (102 runs sampled)

// node version: v14.18.1, date: Sat Nov 20 2021 14:01:08 GMT+0800 (中国标准时间)
// Starting...
// DateTimer(dateNowStarttime) 6ms
// PerformanceTimer(performanceNowStarttime) 5.301500082015991ms
// PerformanceTimerFixedString(performanceNowStarttime) 5.343ms
// PerformanceTimerMicrosecond(performanceNowStarttime) 5385μs
// PerformanceTimerMillisecond(performanceNowStarttime) 5.438ms
// 5 tests completed.

// DateTimer()                   x 20,540,537 ops/sec ±0.77% (96 runs sampled)
// PerformanceTimer()            x  9,779,834 ops/sec ±0.75% (89 runs sampled)
// PerformanceTimerFixedString() x  3,180,287 ops/sec ±0.34% (92 runs sampled)
// PerformanceTimerMicrosecond() x  9,726,309 ops/sec ±0.55% (97 runs sampled)
// PerformanceTimerMillisecond() x  9,639,512 ops/sec ±0.60% (94 runs sampled)

// node version: v12.22.7, date: Sat Nov 20 2021 14:00:16 GMT+0800 (GMT+08:00)
// Starting...
// DateTimer(dateNowStarttime) 6ms
// PerformanceTimer(performanceNowStarttime) 6.380917072296143ms
// PerformanceTimerFixedString(performanceNowStarttime) 6.426ms
// PerformanceTimerMicrosecond(performanceNowStarttime) 6470μs
// PerformanceTimerMillisecond(performanceNowStarttime) 6.513ms
// 5 tests completed.

// DateTimer()                   x 20,966,403 ops/sec ±0.81% (97 runs sampled)
// PerformanceTimer()            x 22,378,897 ops/sec ±0.07% (96 runs sampled)
// PerformanceTimerFixedString() x  3,187,744 ops/sec ±0.14% (93 runs sampled)
// PerformanceTimerMicrosecond() x 21,360,658 ops/sec ±0.98% (93 runs sampled)
// PerformanceTimerMillisecond() x 15,127,442 ops/sec ±0.60% (97 runs sampled)

// node version: v10.24.1, date: Sat Nov 20 2021 13:59:28 GMT+0800 (GMT+08:00)
// Starting...
// DateTimer(dateNowStarttime) 16ms
// PerformanceTimer(performanceNowStarttime) 16.252916932106018ms
// PerformanceTimerFixedString(performanceNowStarttime) 16.491ms
// PerformanceTimerMicrosecond(performanceNowStarttime) 16548μs
// PerformanceTimerMillisecond(performanceNowStarttime) 22.212ms
// 5 tests completed.

// DateTimer()                   x 22,349,551 ops/sec ±0.33% (90 runs sampled)
// PerformanceTimer()            x 30,092,603 ops/sec ±0.96% (89 runs sampled)
// PerformanceTimerFixedString() x  3,248,977 ops/sec ±2.51% (83 runs sampled)
// PerformanceTimerMicrosecond() x 30,358,443 ops/sec ±0.24% (89 runs sampled)
// PerformanceTimerMillisecond() x 18,356,502 ops/sec ±0.70% (93 runs sampled)
// node version: v8.17.0, date: Sat Nov 20 2021 13:58:23 GMT+0800 (CST)
// Starting...
// DateTimer(dateNowStarttime) 4ms
// PerformanceTimer(performanceNowStarttime) 3.2330000400543213ms
// PerformanceTimerFixedString(performanceNowStarttime) 3.285ms
// PerformanceTimerMicrosecond(performanceNowStarttime) 3332μs
// PerformanceTimerMillisecond(performanceNowStarttime) 3.481ms
// 5 tests completed.

// DateTimer()                   x 15,125,135 ops/sec ±0.31% (98 runs sampled)
// PerformanceTimer()            x 25,598,467 ops/sec ±0.30% (94 runs sampled)
// PerformanceTimerFixedString() x  3,406,506 ops/sec ±0.38% (90 runs sampled)
// PerformanceTimerMicrosecond() x 26,842,589 ops/sec ±0.16% (95 runs sampled)
// PerformanceTimerMillisecond() x 26,352,137 ops/sec ±0.42% (89 runs sampled)
