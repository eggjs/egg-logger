'use strict';

const Transport = require('./transport');
const utils = require('../utils');
const levels = require('../level');


/**
 * 将日志输出到终端的 {@link Transport}。
 * 如果指定 EGG_LOG 则是优先级最高的 level。
 */
class ConsoleTransport extends Transport {

  /**
   * @constructor
   * @param {Object} options
   * - {Array} [stderrLevel = ERROR] - 输出到 stderr 的打印级别，必须高于 level
   */
  constructor(options) {
    super(options);
    this.options.stderrLevel = utils.normalizeLevel(this.options.stderrLevel);
    // EGG_LOG 优先级最高
    if (process.env.EGG_LOG) {
      this.options.level = utils.normalizeLevel(process.env.EGG_LOG);
    }
  }

  get defaults() {
    return utils.assign(super.defaults, {
      stderrLevel: 'ERROR',
    });
  }

  /**
   * 输出日志，见 {@link Transport#log}，如果指定了 stderrLevel 会将日志转到 stderr
   * @param  {String} level - 日志级别，必须大写
   * @param  {Array} args - 所有的参数
   * @param  {Object} meta - 元信息
   */
  log(level, args, meta) {
    const msg = super.log(level, args, meta);
    if (levels[level] >= this.options.stderrLevel && levels[level] < levels['NONE']) {
      process.stderr.write(msg);
    } else {
      process.stdout.write(msg);
    }
  }

}

module.exports = ConsoleTransport;
