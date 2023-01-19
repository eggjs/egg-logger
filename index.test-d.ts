import { expectType } from 'tsd';
import { AsyncLocalStorage } from 'async_hooks';
import { EggLoggerOptions, Logger } from '.';

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
