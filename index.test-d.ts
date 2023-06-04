import { expectType } from 'tsd';
import { AsyncLocalStorage } from 'async_hooks';
import { EggLoggerOptions, Logger, EggContextLogger, EggConsoleLogger } from '.';

const options = {
  formatter(meta: any) {
    return 'foo' + meta;
  },
  paddingMessageFormatter(ctx) {
    return '' + ctx;
  },
} as EggLoggerOptions;

expectType<string>(options.formatter!());
expectType<string>(options.paddingMessageFormatter!({}));

const logger = {} as Logger;
expectType<'duplicate' | 'redirect' | 'ignore'>(logger.options.concentrateError!);
expectType<AsyncLocalStorage<any>>(logger.options.localStorage!);

const ctxLogger = {} as EggContextLogger;
expectType<string>(ctxLogger.paddingMessage);
expectType<any>(ctxLogger.ctx);

class CustomEggContextLogger extends EggContextLogger {
  get paddingMessage() {
    return 'hello, ' + this.ctx.url;
  }
}

const customCtxLogger = {} as CustomEggContextLogger;
expectType<string>(customCtxLogger.paddingMessage);
expectType<any>(customCtxLogger.ctx);

const consoleLogger = new EggConsoleLogger();
expectType<number>(consoleLogger.size);
expectType<number>(new EggConsoleLogger({}).size);
expectType<number>(new EggConsoleLogger({ encoding: 'utf8' }).size);
