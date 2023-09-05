'use strict';

const os = require('os');
const util = require('util');
const { performance } = require('perf_hooks');
const chalk = require('chalk');
const utility = require('utility');
const iconv = require('iconv-lite');
const circularJSON = require('circular-json-for-egg');
const { FrameworkBaseError, FrameworkErrorFormater } = require('egg-errors');
const levels = require('./level');

const hostname = os.hostname();
const duartionRegexp = /([0-9]+ms)/g;
// eslint-disable-next-line no-useless-escape
const categoryRegexp = /(\[[\w\-_.:]+\])/g;
const httpMethodRegexp = /(GET|POST|PUT|PATH|HEAD|DELETE) /g;

/**
 * @class LoggerUtils
 */
module.exports = {
  normalizeLevel(level) {
    if (typeof level === 'number') {
      return level;
    }

    // 'WARN' => level.warn
    if (typeof level === 'string' && level) {
      return levels[level.toUpperCase()];
    }
  },

  defaultContextPaddingMessage(ctx) {
    // Auto record necessary request context infomation, e.g.: user id, request spend time
    // format: '[$userId/$ip/$traceId/$use_ms $method $url]'
    const userId = ctx.userId || '-';
    const traceId = ctx.tracer?.traceId || '-';
    let use = 0;
    if (ctx.performanceStarttime) {
      use = Math.floor((performance.now() - ctx.performanceStarttime) * 1000) / 1000;
    } else if (ctx.starttime) {
      use = Date.now() - ctx.starttime;
    }
    return '[' +
      userId + '/' +
      ctx.ip + '/' +
      traceId + '/' +
      use + 'ms ' +
      ctx.method + ' ' +
      ctx.url +
    ']';
  },

  // format with ctx and ctx.tracer
  // Auto record necessary request context infomation, e.g.: user id, request spend time
  // format: '[$userId/$ip/$traceId/$use_ms $method $url]'
  defaultFormatter(meta) {
    let paddingMessage = ' ';
    // try to use the exists paddingMessage first
    if (meta.paddingMessage) {
      paddingMessage = ` ${meta.paddingMessage} `;
    } else {
      // gen the default ctx paddingMessage
      const ctx = meta.ctx;
      if (ctx) {
        paddingMessage = ` ${module.exports.defaultContextPaddingMessage(ctx)} `;
      }
    }
    return meta.date + ' ' + meta.level + ' ' + meta.pid + paddingMessage + meta.message;
  },

  // output to Terminal format
  consoleFormatter(meta) {
    let msg = meta.date + ' ' + meta.level + ' ' + meta.pid + ' ' + meta.message;
    if (!chalk.supportsColor) {
      return msg;
    }

    if (meta.level === 'ERROR') {
      return chalk.red(msg);
    } else if (meta.level === 'WARN') {
      return chalk.yellow(msg);
    }

    msg = msg.replace(duartionRegexp, chalk.green('$1'));
    msg = msg.replace(categoryRegexp, chalk.blue('$1'));
    msg = msg.replace(httpMethodRegexp, chalk.cyan('$1 '));
    return msg;
  },

  /**
   * Get final formated log string buffer
   *
   * Invoke link: {@Link Logger#log} -> {@link Transport#log} -> LoggerUtils.format
   * @function LoggerUtils#format
   * @param {String} level - log level
   * @param {Array} args - format arguments
   * @param {Object} meta - loging behaviour meta infomation
   *  - {String} level
   *  - {Boolean} raw
   *  - {Function} formatter
   *  - {Error} error
   *  - {String} message
   *  - {Number} pid
   *  - {String} hostname
   *  - {String} date
   * @param {Object} options - {@link Transport}'s options
   *  - {String} encoding
   *  - {Boolean} json
   *  - {Boolean} dateISOFormat
   *  - {Function} [formatter]
   *  - {Function} [contextFormatter]
   *  - {Function} [paddingMessageFormatter]
   *  - {number} [maxCauseChainLength]
   * @return {String|Buffer} formatted log string buffer
   */
  format(level, args, meta, options) {
    meta = meta || {};
    let message;
    let output;
    let formatter = meta.formatter || options.formatter;
    if (meta.ctx) {
      if (options.contextFormatter) {
        formatter = options.contextFormatter;
        if (!meta.paddingMessage) {
          // should add paddingMessage to meta on custom contextFormatter
          meta.paddingMessage = options.paddingMessageFormatter ?
            options.paddingMessageFormatter(meta.ctx) : module.exports.defaultContextPaddingMessage(meta.ctx);
        }
      } else if (options.paddingMessageFormatter && !meta.paddingMessage) {
        // use custom paddingMessageFormatter to format paddingMessage
        meta.paddingMessage = options.paddingMessageFormatter(meta.ctx);
      }
    }

    if (args[0] instanceof Error) {
      message = formatError(args[0], options);
    } else {
      message = util.format.apply(util, args);
    }

    if (meta.raw === true) {
      output = message;
    } else if (options.json === true || formatter) {
      meta.level = level;
      meta.date = options.dateISOFormat ? new Date().toISOString() : utility.logDate(',');
      meta.pid = process.pid;
      meta.hostname = hostname;
      meta.message = message;
      if (options.json === true) {
        const outputMeta = { ...meta };
        outputMeta.ctx = undefined;
        output = JSON.stringify(outputMeta);
      } else {
        output = formatter(meta);
      }
    } else {
      output = message;
    }

    if (!output) return Buffer.from('');

    output += options.eol;

    // convert string to buffer when encoding is not utf8
    return options.encoding === 'utf8' ? output : iconv.encode(output, options.encoding);
  },

  // Like `Object.assign`, but don't copy `undefined` value
  assign(target) {
    if (!target) {
      return {};
    }
    const sources = Array.prototype.slice.call(arguments, 1);
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      if (!source) continue;
      const keys = Object.keys(source);
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        if (source[key] !== undefined && source[key] !== null) {
          target[key] = source[key];
        }
      }
    }
    return target;
  },

  formatError,
};

function errorToString(err, options, causeLength) {
  options = options || {};
  const maxCauseChainLength = options.maxCauseChainLength || 10;
  causeLength = causeLength || 0;

  if (causeLength > maxCauseChainLength) return 'too long cause chain';

  if (err.name === 'Error' && typeof err.code === 'string') {
    err.name = err.code + err.name;
  }

  if (err.host) {
    err.message += ` (${err.host})`;
  }

  // name and stack could not be change on node 0.11+
  const errStack = err.stack || 'no_stack';

  const errProperties = Object.keys(err).map(key => inspect(key, err[key])).join('\n');
  if (err.cause) {
    const causeMsg = errorToString(err.cause, options, causeLength + 1);
    return util.format('nodejs.%s: %s\n%s\n%s\ncause:\n\n%s',
      err.name,
      err.message,
      errStack.substring(errStack.indexOf('\n') + 1),
      errProperties,
      causeMsg
    );
  }
  return util.format('nodejs.%s: %s\n%s\n%s',
    err.name,
    err.message,
    errStack.substring(errStack.indexOf('\n') + 1),
    errProperties
  );
}

function formatError(err, options, causeLength) {
  if (FrameworkBaseError.isFrameworkError(err)) {
    return FrameworkErrorFormater.format(err);
  }
  const msg = errorToString(err, options, causeLength);
  return util.format('%s\npid: %s\nhostname: %s\n',
    msg,
    process.pid,
    hostname
  );
}

function inspect(key, value) {
  return `${key}: ${formatObject(value)}`;
}

function formatString(str) {
  if (str.length > 10000) {
    return `${str.substr(0, 10000)}...(${str.length})`;
  }
  return str;
}

function formatBuffer(buf) {
  const tail = buf.data.length > 50 ? ` ...(${buf.data.length}) ` : '';
  const bufStr = buf.data.slice(0, 50).map(i => {
    i = i.toString(16);
    if (i.length === 1) i = `0${i}`;
    return i;
  }).join(' ');
  return `<Buffer ${bufStr}${tail}>`;
}

function formatObject(obj) {
  try {
    return circularJSON.stringify(obj, (key, v) => {
      if (typeof v === 'string') return formatString(v);
      if (v && v.type === 'Buffer' && Array.isArray(v.data)) {
        return formatBuffer(v);
      }
      if (v instanceof RegExp) return util.inspect(v);
      return v;
    });
  } catch (_) {
    /* istanbul ignore next */
    return String(obj);
  }
}
