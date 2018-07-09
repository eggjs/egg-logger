import { levels, EggLogger } from '../../';
const options = JSON.parse(process.argv[2]);
const logger = new EggLogger(options);
logger.info('info foo');
logger.warn('warn foo');
logger.error('error foo');
logger.info(`LoggerLevel ${Object.keys(levels).join(',')}`);
setTimeout(() => process.exit(0), 2000);
