import { expectType } from 'tsd';
import { EggLoggerOptions } from '.';

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
