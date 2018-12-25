import { levels, EggLogger, FileTransport } from '../../';
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

setTimeout(() => process.exit(0), 2000);
