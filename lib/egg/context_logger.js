'use strict';

/**
 * Request context Logger, itself isn't a {@link Logger}.
 */
class ContextLogger {

  /**
   * @constructor
   * @param {Context} ctx - egg Context instance
   * @param {Logger} logger - Logger instance
   */
  constructor(ctx, logger) {
    this.ctx = ctx;
    this._logger = logger;
  }

  get paddingMessage() {
    const ctx = this.ctx;

    // Auto record necessary request context infomation, e.g.: user id, request spend time
    // format: '[$logonId/$userId/$ip/$traceId/$use_ms $method $url]'
    const userId = ctx.userId || '-';
    const logonId = ctx.logonId || '-';
    const traceId = ctx.tracer && ctx.tracer.traceId || '-';
    const use = ctx.starttime ? Date.now() - ctx.starttime : 0;
    return '[' +
      logonId + '/' +
      userId + '/' +
      ctx.ip + '/' +
      traceId + '/' +
      use + 'ms ' +
      ctx.method + ' ' +
      ctx.url +
    ']';
  }
}

[ 'error', 'warn', 'info', 'debug' ].forEach(level => {
  const LEVEL = level.toUpperCase();
  ContextLogger.prototype[level] = function() {
    const meta = {
      formatter: contextFormatter,
      paddingMessage: this.paddingMessage,
    };
    this._logger.log(LEVEL, arguments, meta);
  };
});

module.exports = ContextLogger;

function contextFormatter(meta) {
  return meta.date + ' ' + meta.level + ' ' + meta.pid + ' ' + meta.paddingMessage + ' ' + meta.message;
}
