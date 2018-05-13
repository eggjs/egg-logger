import { Context } from 'egg';

export namespace levels {
  export const ALL: number;
  export const DEBUG: number;
  export const INFO: number;
  export const WARN: number;
  export const ERROR: number;
  export const NONE: number;
}

export type LoggerLevel = keyof typeof levels;

export interface LoggerOptions {
  level?: LoggerLevel;
  encoding?: string;
  consoleLevel?: LoggerLevel;
}

export interface EggLoggerOptions extends LoggerOptions {
  file: string;
  formatter?: any;
  jsonFile?: string;
  outputJSON?: boolean;
  buffer?: boolean;
  eol?: string;
}

export class Logger<T extends LoggerOptions = LoggerOptions> {
  constructor(options: T);

  /**
   * disable a transport
   * @param {String} name - transport name
   */
  disable(name: string): void;

  /**
   * enable a transport
   * @param {String} name - transport name
   */
  enable(name: string): void;

  /**
   * Send log to all transports.
   * It's proxy to {@link Transport}'s log method.'
   * @param {String} level - log level
   * @param {Array} args - log arguments
   * @param {Object} meta - log meta
   */
  log(level: string, args: any[], meta: object): void;

  /**
   * write raw log to all transports
   * @param {String} msg - log message
   */
  write(msg: string): void;

  /**
   * Redirect specify level log to the other logger
   * @param {String} level - log level
   * @param {Logger} logger - target logger instance
   */
  redirect(level: string, logger: Logger): void;

  /**
   * Un-redirect specify level log
   * @param {String} level - log level
   */
  unredirect(level: string): void;

  /**
   * Reload all transports
   */
  reload(): void;

  /**
   * End all transports
   */
  close(): void;

  error(msg: any, ...args: any[]): void;
  warn(msg: any, ...args: any[]): void;
  info(msg: any, ...args: any[]): void;
  debug(msg: any, ...args: any[]): void;
}

export class EggLogger extends Logger<EggLoggerOptions> {
  level: LoggerLevel;
  consoleLevel: LoggerLevel;
}

export class EggErrorLogger extends Logger {}
export class EggConsoleLogger extends Logger {}
export class EggCustomLogger extends Logger {}

export class EggContextLogger {
  constructor(ctx: Context, logger: Logger);
  readonly paddingMessage: string;
  write(msg: string): void;
  error(msg: any, ...args: any[]): void;
  warn(msg: any, ...args: any[]): void;
  info(msg: any, ...args: any[]): void;
  debug(msg: any, ...args: any[]): void;
}

export interface EggLoggersOptions {
  env?: string;
  type: string;
  dir: string;
  encoding?: string;
  level?: LoggerLevel;
  consoleLevel?: LoggerLevel;
  outputJSON?: boolean;
  buffer?: boolean;
  appLogName: string;
  coreLogName: string;
  agentLogName: string;
  errorLogName: string;
  eol?: string;
}

export class EggLoggers extends Map {
  constructor(options: EggLoggersOptions);

  /**
   * Disable console logger
   */
  disableConsole(): void;

  /**
   * reload all logger
   */
  reload(): void;

  /**
   * Add a logger
   * @param {String} name - logger name
   * @param {Logger} logger - Logger instance
   */
  set(name: string, logger: Logger);
}

export interface TransportOption {
  level?: LoggerLevel;
  formatter?: any;
  json?: boolean;
  encoding?: string;
  eol?: string;
}

export interface FileTransportOption extends TransportOption {
  file: string;
}

export interface FileBufferTransportOption extends FileTransportOption {
  flushInterval?: number;
  maxBufferLength?: number;
}

export interface ConsoleTransportOption extends TransportOption {
  stderrLevel?: string;
}

export class Transport<T extends TransportOption = TransportOption> {
  constructor(options: T);
  readonly enabled: boolean;
  level: LoggerLevel;
  enable(): void;
  shouldLog(level: LoggerLevel): boolean;
  log(level, args: any[], meta: object): void;
  reload(): void;
  close(): void;
  end(): void;
}
export class FileTransport extends Transport<FileTransportOption> {}
export class FileBufferTransport extends Transport<FileBufferTransportOption> {
  flush(): void;
}
export class ConsoleTransport extends Transport<ConsoleTransportOption> {}
