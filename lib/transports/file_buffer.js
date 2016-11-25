'use strict';

const depd = require('depd')('egg-logger');
const FileTransport = require('./file');
const utils = require('../utils');
const Flushable = require('flushable');

/**
 * 继承自 {@link FileTransport}，将日志写入内存中，一定时间内统一写入文件来提高性能
 */
class FileBufferTransport extends FileTransport {

  /**
   * @constructor
   * @param {Object} options
   * - {String} file - 日志的文件路径
   * - {Number} [flushInterval = 1000] - 日志写入频率，一定时间后写入文件
   * - {String} [level = INFO] - 日志级别
   */

  get defaults() {
    return utils.assign(super.defaults, {
      flushInterval: 1000,
    });
  }

  /**
   * 创建一个 stream
   * @return {Stream} 返回一个 writeStream
   * @private
   */
  _createStream() {
    mkdirp.sync(path.dirname(this.options.file));
    return new Flushable()
          .on('error', onError)
          .pipe(fs.createWriteStream(this.options.file, { flags: 'a' }))
          .on('error', onError);
  }

}

module.exports = FileBufferTransport;
