import { expectType } from 'tsd';
import { AsyncLocalStorage } from 'async_hooks';
import { EggLoggerOptions, Logger, EggContextLogger } from '.';

const options = {
  formatter(meta) {
    return 'foo' + meta;
  },
  paddingMessageFormatter(ctx) {
    return '' + ctx;
  },
} as EggLoggerOptions;

expectType<string>(options.formatter!({}));
expectType<string>(options.paddingMessageFormatter!({}));

const logger = {} as Logger;
expectType<'duplicate' | 'redirect' | 'ignore'>(logger.options.concentrateError!);
expectType<AsyncLocalStorage<any>>(logger.options.localStorage!);

const ctxLogger = {} as EggContextLogger;
expectType<string>(ctxLogger.paddingMessage);
expectType<object>(ctxLogger.ctx);

class CustomEggContextLogger extends EggContextLogger {
  get paddingMessage() {
    return 'hello, ' + this.ctx.url;
  }
}

const customCtxLogger = {} as CustomEggContextLogger;
expectType<string>(customCtxLogger.paddingMessage);
expectType<object>(customCtxLogger.ctx);
