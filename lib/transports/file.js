'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { mkdirSync } = require('fs');
const utility = require('utility');
const depd = require('depd')('egg-logger');
const Transport = require('./transport');
const utils = require('../utils');


/**
 * output log into file {@link Transport}。
 */
class FileTransport extends Transport {

  /**
   * @class
   * @param {Object} options
   * - {String} file - file path
   * - {String} [level = INFO] - log level
   */
  constructor(options) {
    super(options);
    assert(this.options.file, 'should pass options.file');

    this._stream = null;
    this.reload();
  }

  get defaults() {
    return utils.assign(super.defaults, {
      file: null,
      level: 'INFO',
    });
  }

  /**
   * reload file stream
   */
  reload() {
    this._closeStream();
    this._stream = this._createStream();
  }

  /**
   * output log, see {@link Transport#log}
   * @param  {String} level - log level
   * @param  {Array} args - all arguments
   * @param  {Object} meta - meta information
   */
  log(level, args, meta) {
    if (!this.writable) {
      // ignore error on unittest env
      if (process.env.NODE_ENV === 'test') return;
      const err = new Error(`${this.options.file} log stream had been closed`);
      console.error(err.stack);
      return;
    }
    const buf = super.log(level, args, meta);
    if (buf.length) {
      this._write(buf);
    }
  }

  /**
   * close stream
   */
  close() {
    this._closeStream();
  }

  /**
   * @deprecated
   */
  end() {
    depd('transport.end() is deprecated, use transport.close()');
    this.close();
  }

  /**
   * write stream directly
   * @param {Buffer|String} buf - log content
   * @private
   */
  _write(buf) {
    this._stream.write(buf);
  }

  /**
   * transport is writable
   * @return {Boolean} writable
   */
  get writable() {
    return this._stream && !this._stream.closed && this._stream.writable && !this._stream.destroyed;
  }

  /**
   * create stream
   * @return {Stream} return writeStream
   * @private
   */
  _createStream() {
    mkdirSync(path.dirname(this.options.file), { recursive: true });
    const stream = fs.createWriteStream(this.options.file, { flags: 'a' });

    const onError = err => {
      console.error('%s ERROR %s [egg-logger] [%s] %s',
        utility.logDate(','), process.pid, this.options.file, err.stack);
      this.reload();
      console.warn('%s WARN %s [egg-logger] [%s] reloaded', utility.logDate(','), process.pid, this.options.file);
    };
    // only listen error once because stream will reload after error
    stream.once('error', onError);
    stream._onError = onError;
    return stream;
  }

  /**
   * close stream
   * @private
   */
  _closeStream() {
    if (this._stream) {
      this._stream.end();
      this._stream.removeListener('error', this._stream._onError);
      this._stream = null;
    }
  }

}

module.exports = FileTransport;
