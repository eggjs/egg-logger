import { LoggerLevel, EggLogger } from '../../index';
const options = JSON.parse(process.argv[2]);
const logger = new EggLogger(options);
const arr = [
  LoggerLevel.all, LoggerLevel.debug, LoggerLevel.error, LoggerLevel.info,
  LoggerLevel.none, LoggerLevel.warn,
]

logger.info('info foo');
logger.warn('warn foo');
logger.error('error foo');
logger.info(`LoggerLevel ${arr.join(',')}`);
setTimeout(() => process.exit(0), 2000);
