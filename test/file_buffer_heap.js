'use strict';

const fs = require('fs');
const heapdump = require('heapdump');
const sleep = require('mz-modules/sleep');
const Logger = require('../index').Logger;
const FileBufferTransport = require('../index').FileBufferTransport;

const logger = new Logger();
const transport = new FileBufferTransport({
  file: 'a.log',
  level: 'INFO',
});
logger.set('file', transport);

async function run() {
  let count = 0;
  let writeCount = 0;
  const start = Date.now();

  const write = fs.write;
  fs.write = function fsWrite(...args) {
    writeCount++;
    if (writeCount !== 3) return write.apply(fs, args);
    const cb = args[args.length - 1];
    cb(new Error('write error'));
  };
  while(Date.now() - start < 1 * 60 * 1000) {
    logger.info('log %s %s', new Date(), count++);
    await sleep(1);
  }

  // reload will create a new stream, it will release referer of old stream and gc
  // logger.reload()

  logger.close();
  await sleep(1000);
}

run()
  .then(() => process.exit())
  .catch(err => console.log(err));

process.once('exit', () => {
  heapdump.writeSnapshot('logger.heapsnapshot');
});
