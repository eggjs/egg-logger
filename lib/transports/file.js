'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const mkdirp = require('mkdirp');
const utility = require('utility');
const depd = require('depd')('egg-logger');
const Transport = require('./transport');
const utils = require('../utils');
const BUF = Symbol('FileTransport#BUF');


/**
 * 将日志输出到文件的 {@link Transport}。
 */
class FileTransport extends Transport {

  /**
   * @constructor
   * @param {Object} options
   * - {String} file - 日志的文件路径
   * - {String} [level = INFO] - 日志级别
   */
  constructor(options) {
    super(options);
    assert(this.options.file, 'should pass options.file');

    this._stream = null;
    this[BUF] = [];
    this._canWrite = true;
    this.reload();
  }

  get defaults() {
    return utils.assign(super.defaults, {
      file: null,
      level: 'INFO',
    });
  }

  /**
   * 重新载入日志文件
   */
  reload() {
    // 关闭原来的 stream
    this._closeStream();
    // 新创建一个 stream
    this._stream = this._createStream();
    this._stream.on('drain', () => {
      this.flush();
    });
  }

  /**
   * 输出日志，见 {@link Transport#log}
   * @param  {String} level - 日志级别
   * @param  {Array} args - 所有的参数
   * @param  {Object} meta - 元信息
   */
  log(level, args, meta) {
    if (!this._stream) {
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
   * 关闭 stream
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
   * 直接写入 stream
   * @param {Buffer|String} buf - 日志内容
   * @private
   */
  _write(buf) {
    if (this._canWrite) {
      this._canWrite = this._stream.write(buf);
    } else {
      this[BUF].push(buf);
    }
  }

  /**
   * 将内存中的字符写入文件中
   */
  flush() {
    if (this[BUF].length > 0) {
      if (this.options.encoding === 'utf8') {
        this._canWrite = this._stream.write(this[BUF].join(''));
      } else {
        this._canWrite = this._stream.write(Buffer.concat(this[BUF]));
      }
      this[BUF] = [];
    }
  }

  /**
   * 创建一个 stream
   * @return {Stream} 返回一个 writeStream
   * @private
   */
  _createStream() {
    mkdirp.sync(path.dirname(this.options.file));
    const stream = fs.createWriteStream(this.options.file, { flags: 'a' });
    stream.on('error', onError);
    return stream;
  }

  /**
   * 关闭 stream
   * @private
   */
  _closeStream() {
    if (this[BUF] && this[BUF].length > 0) {
      this.flush();
    }

    if (this._stream) {
      this._stream.end();
      this._stream.removeListener('error', onError);
      this._stream = null;
    }
  }

}

module.exports = FileTransport;

function onError(err) {
  console.error('%s ERROR %s [chair-logger:buffer_write_stream] %s: %s\n%s',
    utility.logDate(','), process.pid, err.name, err.message, err.stack);
}
