'use strict';

const depd = require('depd')('egg-logger');
const FileTransport = require('./file');
const utils = require('../utils');

/**
 * 继承自 {@link FileTransport}，将日志写入内存中，一定时间内统一写入文件来提高性能
 */
class FileBufferTransport extends FileTransport {

  /**
   * @constructor
   * @param {Object} options
   * - {String} file - 日志的文件路径
   * - {Number} [flushInterval = 1000] - 日志写入频率，一定时间后写入文件
   * - {Number} [maxBufferLength = 1000] - 日志写入缓存队列最大长度
   * - {String} [level = INFO] - 日志级别
   */
  constructor(options) {
    super(options);

    this._bufSize = 0;
    this._buf = [];
    this._timer = this._createInterval();
  }

  get defaults() {
    return utils.assign(super.defaults, {
      flushInterval: 1000,
      maxBufferLength: 1000,
    });
  }

  /**
   * 关闭 stream 和定时器
   */
  close() {
    this._closeInterval();
    super.close();
  }

  /**
   * @deprecated
   */
  end() {
    depd('transport.end() is deprecated, use transport.close()');
    this.close();
  }

  /**
   * 将内存中的字符写入文件中
   */
  flush() {
    if (this._buf.length > 0) {
      if (this.options.encoding === 'utf8') {
        this._stream.write(this._buf.join(''));
      } else {
        this._stream.write(Buffer.concat(this._buf, this._bufSize));
      }
      this._buf = [];
      this._bufSize = 0;
    }
  }

  /**
   * 覆盖父类，在关闭 stream 之前先 flush 下
   * @private
   */
  _closeStream() {
    // FileTransport 在初始化时会 reload，这时 _buf 还未初始化
    if (this._buf && this._buf.length > 0) {
      this.flush();
    }
    super._closeStream();
  }

  /**
   * 覆盖父类，写入内存
   * @param {Buffer} buf - 日志内容
   * @private
   */
  _write(buf) {
    this._bufSize += buf.length;
    this._buf.push(buf);
    if (this._buf.length > this.options.maxBufferLength) {
      this.flush();
    }
  }

  /**
   * 创建定时器，一定时间内写入文件
   * @return {Interval} 定时器
   * @private
   */
  _createInterval() {
    return setInterval(() => this.flush(), this.options.flushInterval);
  }

  /**
   * 关闭定时器
   * @private
   */
  _closeInterval() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
}

module.exports = FileBufferTransport;
