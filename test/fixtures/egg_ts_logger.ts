import { levels, EggLogger, FileTransport, EggLoggers } from '../../';

const options = JSON.parse(process.argv[2]);
const logger = new EggLogger(options);
logger.info('info foo');
logger.warn('warn foo');
logger.error('error foo');
logger.info(`LoggerLevel ${Object.keys(levels).join(',')}`);

const customTransport = new FileTransport({
  file: options.customFile,
  level: 'INFO'
});

logger.set('file', customTransport);
logger.info('info foo');
logger.warn('warn foo');
logger.error('error foo');
logger.info(`LoggerLevel ${Object.keys(levels).join(',')}`);
logger.close();

const eggLoggersOptions = JSON.parse(process.argv[3]);
const eggLoggers = new EggLoggers(eggLoggersOptions);

for (const [name, logger] of eggLoggers.entries()) {
  logger.info('info', name);
  logger.warn('warn', name);
  logger.error('error', name);
}

for (const logger of eggLoggers.values()) {
  logger.close();
}

setTimeout(() => { process.exit(0) }, 2000);
