'use strict';

exports.ALL = -Infinity;

/**
 * Debug log for execute tracing
 *
 * @function Logger#debug
 * @param {String} msg - log message
 */
exports.DEBUG = 0;

/**
 * Normal infomaction loging
 * @function Logger#info
 * @param {String} msg - log message
 */
exports.INFO = 1;

/**
 * Warning information loging
 * @function Logger#warn
 * @param {String} msg - log message
 */
exports.WARN = 2;

/**
 * Error or exception loging
 * @function Logger#error
 * @param {String|Error} msg - log message or error instance
 */
exports.ERROR = 3;

exports.NONE = Infinity;
