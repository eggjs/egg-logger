# egg-logger

[![NPM version][npm-image]][npm-url]
[![CI](https://github.com/eggjs/egg-logger/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eggjs/egg-logger/actions/workflows/nodejs.yml)
[![Test coverage][codecov-image]][codecov-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-logger.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-logger
[codecov-image]: https://codecov.io/github/eggjs/egg-logger/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-logger?branch=master
[snyk-image]: https://snyk.io/test/npm/egg-logger/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-logger
[download-image]: https://img.shields.io/npm/dm/egg-logger.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-logger

Egg logger.

![diagram](diagram.png)

Including two base class, `Logger` and `Transport`:

- Transport: Save log to file, stdout/stderr and network.
- Logger: A logger can contains multi transports.

---

## Install

```bash
$ npm i egg-logger
```

## Usage

Create a `Logger` and add a file `Transport`.

```js
const Logger = require('egg-logger').Logger;
const FileTransport = require('egg-logger').FileTransport;
const ConsoleTransport = require('egg-logger').ConsoleTransport;

const logger = new Logger();
logger.set('file', new FileTransport({
  file: '/path/to/file',
  level: 'INFO',
}));
logger.set('console', new ConsoleTransport({
  level: 'DEBUG',
}));
logger.debug('debug foo'); // only output to stdout
logger.info('info foo');
logger.warn('warn foo');
logger.error(new Error('error foo'));
```

### Enable / Disable Transport

```js
logger.disable('file');
logger.info('info'); // output nothing
logger.enable('file');
logger.info('info'); // output 'info' string
```

### Duplicate

Duplicate error log to other logger.

Accept an `options.excludes` to special whether excludes some tranports.

```js
logger.duplicate('error', errorLogger, { excludes: [ 'console' ]});
logger.error(new Error('print to errorLogger')); // will additional call `errorLogger.error`
```

### Redirect

Redirect special level log to other logger.

```js
oneLogger.redirect('debug', debugLogger); // all debug level logs of `oneLogger` will delegate to debugLogger
```

### Reload

```js
logger.reload(); // will close the exists write stream and create a new one.
```

### Custom Transport

You can make your own `Transport` for logging，e.g.: send log to your logging server.

```js
const urllib = require('urllib');
const Transport = require('egg-logger').Transport;

class UrllibTransport extends Transport {

  log(level, args, meta) {
    const msg = super.log(level, args, meta);
    return urllib.request('url?msg=' + msg);
  }
}

const logger = new Logger();
logger.set('remote', new UrllibTransport({
  level: 'DEBUG',
}));
logger.info('info');
```

## Console logger level

set environment NODE_CONSOLE_LOGGRE_LEVEL = 'INFO' | 'WARN' | 'ERROR'


## License

[MIT](LICENSE)
<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars.githubusercontent.com/u/156269?v=4" width="100px;"/><br/><sub><b>fengmk2</b></sub>](https://github.com/fengmk2)<br/>|[<img src="https://avatars.githubusercontent.com/u/985607?v=4" width="100px;"/><br/><sub><b>dead-horse</b></sub>](https://github.com/dead-horse)<br/>|[<img src="https://avatars.githubusercontent.com/u/360661?v=4" width="100px;"/><br/><sub><b>popomore</b></sub>](https://github.com/popomore)<br/>|[<img src="https://avatars.githubusercontent.com/u/227713?v=4" width="100px;"/><br/><sub><b>atian25</b></sub>](https://github.com/atian25)<br/>|[<img src="https://avatars.githubusercontent.com/u/2160731?v=4" width="100px;"/><br/><sub><b>mansonchor</b></sub>](https://github.com/mansonchor)<br/>|[<img src="https://avatars.githubusercontent.com/u/5856440?v=4" width="100px;"/><br/><sub><b>whxaxes</b></sub>](https://github.com/whxaxes)<br/>|
| :---: | :---: | :---: | :---: | :---: | :---: |
|[<img src="https://avatars.githubusercontent.com/u/3367820?v=4" width="100px;"/><br/><sub><b>Jeff-Tian</b></sub>](https://github.com/Jeff-Tian)<br/>|[<img src="https://avatars.githubusercontent.com/u/19274678?v=4" width="100px;"/><br/><sub><b>andy-ms</b></sub>](https://github.com/andy-ms)<br/>|[<img src="https://avatars.githubusercontent.com/u/1474688?v=4" width="100px;"/><br/><sub><b>luckydrq</b></sub>](https://github.com/luckydrq)<br/>|[<img src="https://avatars.githubusercontent.com/u/2842176?v=4" width="100px;"/><br/><sub><b>XadillaX</b></sub>](https://github.com/XadillaX)<br/>|[<img src="https://avatars.githubusercontent.com/u/8201516?v=4" width="100px;"/><br/><sub><b>linrf</b></sub>](https://github.com/linrf)<br/>|[<img src="https://avatars.githubusercontent.com/u/30541930?v=4" width="100px;"/><br/><sub><b>duqingyu</b></sub>](https://github.com/duqingyu)<br/>|
[<img src="https://avatars.githubusercontent.com/u/7779883?v=4" width="100px;"/><br/><sub><b>lix059</b></sub>](https://github.com/lix059)<br/>|[<img src="https://avatars.githubusercontent.com/u/2675419?v=4" width="100px;"/><br/><sub><b>congyuandong</b></sub>](https://github.com/congyuandong)<br/>|[<img src="https://avatars.githubusercontent.com/u/1763067?v=4" width="100px;"/><br/><sub><b>waitingsong</b></sub>](https://github.com/waitingsong)<br/>

This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Sat Dec 10 2022 21:18:13 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->
