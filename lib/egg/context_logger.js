'use strict';

const { contextFormatter } = require('../utils');

/**
 * Request context Logger, itself isn't a {@link Logger}.
 */
class ContextLogger {
  /**
   * @class
   * @param {Context} ctx - egg Context instance
   * @param {Logger} logger - Logger instance
   */
  constructor(ctx, logger) {
    this.ctx = ctx;
    this._logger = logger;
  }

  write(msg) {
    this._logger.write(msg);
  }
}

// logger.error()/warn()/info()/debug()
[ 'error', 'warn', 'info', 'debug' ].forEach(level => {
  const LEVEL = level.toUpperCase();
  ContextLogger.prototype[level] = function(...args) {
    const meta = {
      formatter: contextFormatter,
      ctx: this.ctx,
    };
    this._logger.log(LEVEL, args, meta);
  };
});

module.exports = ContextLogger;
