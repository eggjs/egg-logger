'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const sleep = require('co-sleep');
const FileBufferTransport = require('../../../index').FileBufferTransport;
const Logger = require('../../../index').Logger;

describe('test/transports/file_buffer.test.js', () => {

  const tmp = path.join(__dirname, '../../fixtures/tmp');
  afterEach(() => {
    rimraf.sync(tmp);
  });

  it('should write to file after flushInterval hit', function*() {
    const logger = new Logger();
    const transport = new FileBufferTransport({
      file: path.join(tmp, 'a.log'),
      level: 'INFO',
    });
    logger.set('file', transport);
    logger.info('info foo');

    // flush is 1000 by default
    yield sleep(100);
    transport._buf.length.should.not.eql(0);
    let content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    content.should.eql('');

    yield sleep(1000);
    content = fs.readFileSync(path.join(tmp, 'a.log'), 'utf8');
    content.should.eql('info foo\n');
  });

  it('should close timer after logger close', () => {
    const logger = new Logger();
    const transport = new FileBufferTransport({
      file: path.join(tmp, 'a.log'),
      level: 'INFO',
    });
    logger.set('file', transport);
    logger.close();
    (transport._timer === null).should.equal(true);
  });
});
