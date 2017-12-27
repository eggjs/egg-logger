'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const mkdirp = require('mkdirp');
const utility = require('utility');
const depd = require('depd')('egg-logger');
const Transport = require('./transport');
const utils = require('../utils');


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
    this._stream.write(buf);
  }

  /**
   * 创建一个 stream
   * @return {Stream} 返回一个 writeStream
   * @private
   */
  _createStream() {
    mkdirp.sync(path.dirname(this.options.file));
    const stream = fs.createWriteStream(this.options.file, { flags: 'a' });

    const onError = err => {
      console.error('%s ERROR %s [egg-logger] [%s] %s',
        utility.logDate(','), process.pid, this.options.file, err.stack);
      this.reload();
      console.warn('%s WARN %s [egg-logger] [%s] reloaded', utility.logDate(','), process.pid, this.options.file);
    };
    stream.on('error', onError);
    stream._onError = onError;
    return stream;
  }

  /**
   * 关闭 stream
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
