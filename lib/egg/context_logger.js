'use strict';

const depd = require('depd')('egg-logger');
const { defaultContextPaddingMessage } = require('../utils');

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
    depd('EggContextLogger is deprecated, use the EggLogger directly');
  }

  // sub class can override this getter
  get paddingMessage() {
    return defaultContextPaddingMessage(this.ctx);
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
      paddingMessage: this.paddingMessage,
      ctx: this.ctx,
    };
    this._logger.log(LEVEL, args, meta);
  };
});

module.exports = ContextLogger;
