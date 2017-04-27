'use strict';

const os = require('os');
const utils = require('../utils');
const levels = require('../level');

const ENABLED = Symbol('Transport#enabled');

/**
 * Transport 是日志的一种输出通道，可以输出到文件，终端或服务等。
 * 一个 {@link Logger} 可以配置多个 Transport 来满足各种复杂的需求
 */
class Transport {

  /**
   * @constructor
   * @param  {Object} options
   * - {String} [level = NONE] - 日志打印级别，打印的方法必须高于此配置方法。如配置了 info，debug 不会打印。
   * - {Function} formatter - 格式化函数
   * - {Boolean} [json = false] - 日志内容是否为 json 格式
   * - {String} [encoding = utf8] - 文件编码，可选编码 {@link https://github.com/ashtuchkin/iconv-lite#supported-encodings}
   * - {String} [eol = os.EOL] - 换行符
   */
  constructor(options) {
    this.options = utils.assign(this.defaults, options);
    if (this.options.encoding === 'utf-8') {
      this.options.encoding = 'utf8';
    }
    this.options.level = utils.normalizeLevel(this.options.level);
    this[ENABLED] = true;
  }

  get defaults() {
    return {
      level: 'NONE',
      formatter: null,
      json: false,
      encoding: 'utf8',
      eol: os.EOL,
    };
  }

  /**
   * 是否开启，如果关闭则不会输出日志
   * @return {[type]} [description]
   */
  get enabled() {
    return this[ENABLED];
  }

  /**
   * 开启 transport
   */
  enable() {
    this[ENABLED] = true;
  }

  /**
   * 关闭 transport，关闭后不会写入日志
   */
  disable() {
    this[ENABLED] = false;
  }

  set level(level) {
    this.options.level = utils.normalizeLevel(level);
  }

  get level() {
    return this.options.level;
  }

  /**
   * 是否应该打印日志
   * @param  {String} level 日志级别，必须大写
   * @return {Boolean} 返回打印状态
   */
  shouldLog(level) {
    if (!this[ENABLED]) {
      return false;
    }

    // 如果指定了 NONE 就不打印
    if (this.options.level === levels['NONE']) {
      return false;
    }

    return this.options.level <= levels[level];
  }

  /**
   * Transport 统一的记录日志的方法，会根据配置输出不同格式
   * @param  {String} level - 日志级别
   * @param  {Array} args - 所有的参数
   * @param  {Object} meta - 元信息
   * @return {Buffer|String} 日志信息 - 如果无内容会返回空字符串, utf8编码返回 String, 其他编码返回 Buffer
   */
  log(level, args, meta) {
    return utils.format(level, args, meta, this.options);
  }

  /**
   * 重载 Transport，无特殊情况可不覆盖
   */
  reload() {}

  /**
   * 关闭 Transport，无特殊情况可不覆盖
   */
  close() {}
  end() {}
}

module.exports = Transport;
