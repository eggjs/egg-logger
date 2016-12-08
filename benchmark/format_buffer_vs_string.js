'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const util = require('util');
const utility = require('utility');
const os = require('os');
const iconv = require('iconv-lite');
const stringFormat = require('../lib/utils').format;
const formatError = require('../lib/utils').formatError;

const hostname = os.hostname();

function bufferFormat(level, args, meta, options) {
  meta = meta || {};
  let message;
  let output;
  const formatter = meta.formatter || options.formatter;

  if (args[0] instanceof Error) {
    message = formatError(args[0]);
  } else {
    message = util.format.apply(util, args);
  }

  if (meta.raw === true) {
    output = message;
  } else if (options.json === true || formatter) {
    meta.level = level;
    meta.date = utility.logDate(',');
    meta.pid = process.pid;
    meta.hostname = hostname;
    meta.message = message;
    output = options.json === true ? JSON.stringify(meta) : formatter(meta);
  } else {
    output = message;
  }

  if (!output) return new Buffer('');

  output += options.eol;

  // convert string to buffer when encoding is not utf8
  return options.encoding === 'utf8' ? new Buffer(output) : iconv.encode(output, options.encoding);
}

console.log(bufferFormat('info', [ 'this is %s, hi %j', 'bufferFormat', { foo: 'bar' }], null, { encoding: 'utf8', eol: '\n' }));
console.log(stringFormat('info', [ 'this is %s, hi %j', 'stringFormat', { foo: 'bar' }], null, { encoding: 'utf8', eol: '\n' }));

const suite = new Benchmark.Suite();

suite

.add('bufferFormat without arguments', () => {
  bufferFormat('info', [ 'info without arguments and message is litte bit long ........ hahah' ], null, { encoding: 'utf8', eol: '\n' });
})
.add('stringFormat without arguments', () => {
  stringFormat('info', [ 'info without arguments and message is litte bit long ........ hahah' ], null, { encoding: 'utf8', eol: '\n' });
})
.add('bufferFormat with arguments', () => {
  bufferFormat('info', [ 'info %s %s %s %s %d %s', 'a', 'bbbb', 'ccccc', 'ddddd', 123123, 'this is long string mmmmmmm' ], null, { encoding: 'utf8', eol: '\n' });
})
.add('stringFormat with arguments', () => {
  stringFormat('info', [ 'info %s %s %s %s %d %s', 'a', 'bbbb', 'ccccc', 'ddddd', 123123, 'this is long string mmmmmmm' ], null, { encoding: 'utf8', eol: '\n' });
})
.add('bufferFormat with json', () => {
  bufferFormat('info', [ 'this is json %j', { a: 'a', b: 'bbbb', c: 'ccccc', d: 'ddddd', e: 123123, f: 'this is long string mmmmmmm' }], null, { encoding: 'utf8', eol: '\n' });
})
.add('stringFormat with json', () => {
  stringFormat('info', [ 'this is json %j', { a: 'a', b: 'bbbb', c: 'ccccc', d: 'ddddd', e: 123123, f: 'this is long string mmmmmmm' }], null, { encoding: 'utf8', eol: '\n' });
})

.on('cycle', event => {
  benchmarks.add(event.target);
})
.on('start', () => {
  console.log('\n  node version: %s, date: %s\n  Starting...', process.version, Date());
})
.on('complete', () => {
  benchmarks.log();
  // process.exit(0);
})
.run({ async: false });

// <Buffer 74 68 69 73 20 69 73 20 62 75 66 66 65 72 46 6f 72 6d 61 74 2c 20 68 69 20 7b 22 66 6f 6f 22 3a 22 62 61 72 22 7d 0a>
//   this is stringFormat, hi {"foo":"bar"}
//
//
//   node version: v7.2.1, date: Thu Dec 08 2016 12:58:56 GMT+0800 (CST)
//   Starting...
//   6 tests completed.
//
//   bufferFormat without arguments x   952,635 ops/sec ±1.10% (84 runs sampled)
//   stringFormat without arguments x 2,860,847 ops/sec ±1.31% (88 runs sampled)
//   bufferFormat with arguments    x   526,491 ops/sec ±1.10% (90 runs sampled)
//   stringFormat with arguments    x 1,209,452 ops/sec ±1.23% (87 runs sampled)
//   bufferFormat with json         x   373,778 ops/sec ±2.04% (87 runs sampled)
//   stringFormat with json         x   611,491 ops/sec ±1.41% (85 runs sampled)

// <Buffer 74 68 69 73 20 69 73 20 62 75 66 66 65 72 46 6f 72 6d 61 74 2c 20 68 69 20 7b 22 66 6f 6f 22 3a 22 62 61 72 22 7d 0a>
//   this is stringFormat, hi {"foo":"bar"}
//
//
//   node version: v6.9.2, date: Thu Dec 08 2016 13:44:51 GMT+0800 (CST)
//   Starting...
//   6 tests completed.
//
//   bufferFormat without arguments x  1,194,705 ops/sec ±1.47% (88 runs sampled)
//   stringFormat without arguments x 12,621,004 ops/sec ±1.30% (84 runs sampled)
//   bufferFormat with arguments    x    533,374 ops/sec ±9.83% (78 runs sampled)
//   stringFormat with arguments    x  1,640,204 ops/sec ±6.34% (72 runs sampled)
//   bufferFormat with json         x    395,705 ops/sec ±2.38% (84 runs sampled)
//   stringFormat with json         x    731,545 ops/sec ±2.98% (79 runs sampled)

// <Buffer 74 68 69 73 20 69 73 20 62 75 66 66 65 72 46 6f 72 6d 61 74 2c 20 68 69 20 7b 22 66 6f 6f 22 3a 22 62 61 72 22 7d 0a>
//   this is stringFormat, hi {"foo":"bar"}
//
//
//   node version: v4.7.0, date: Thu Dec 08 2016 13:46:07 GMT+0800 (CST)
//   Starting...
//   6 tests completed.
//
//   bufferFormat without arguments x   759,517 ops/sec ±1.95% (84 runs sampled)
//   stringFormat without arguments x 3,724,952 ops/sec ±1.04% (88 runs sampled)
//   bufferFormat with arguments    x   395,182 ops/sec ±8.14% (74 runs sampled)
//   stringFormat with arguments    x 1,203,414 ops/sec ±2.59% (81 runs sampled)
//   bufferFormat with json         x   324,741 ops/sec ±3.00% (83 runs sampled)
//   stringFormat with json         x   616,523 ops/sec ±3.73% (86 runs sampled)
