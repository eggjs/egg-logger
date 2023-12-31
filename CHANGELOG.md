# Changelog

## [3.4.2](https://github.com/eggjs/egg-logger/compare/v3.4.1...v3.4.2) (2023-12-31)


### Bug Fixes

* should add paddingMessage on ConsoleLogger ([#93](https://github.com/eggjs/egg-logger/issues/93)) ([eb73f50](https://github.com/eggjs/egg-logger/commit/eb73f5065b6b319541a4e7bd0f7df0003caf4b6b))

## [3.4.1](https://github.com/eggjs/egg-logger/compare/v3.4.0...v3.4.1) (2023-10-16)


### Bug Fixes

* should use paddingMessageFormatter on ConsoleTransport options ([#92](https://github.com/eggjs/egg-logger/issues/92)) ([32ec755](https://github.com/eggjs/egg-logger/commit/32ec755f71f8c4ee366d3eb22cc529184d73becc))

## [3.4.0](https://github.com/eggjs/egg-logger/compare/v3.3.1...v3.4.0) (2023-09-05)


### Features

* print err.cause if exists ([#91](https://github.com/eggjs/egg-logger/issues/91)) ([a054bca](https://github.com/eggjs/egg-logger/commit/a054bca78a44dc856405ee91c2a8dba481aef2b1))

## [3.3.1](https://github.com/eggjs/egg-logger/compare/v3.3.0...v3.3.1) (2023-06-05)


### Bug Fixes

* allow EggConsoleLogger init without options ([#90](https://github.com/eggjs/egg-logger/issues/90)) ([e4ff375](https://github.com/eggjs/egg-logger/commit/e4ff375caa0e1b761f494b48f37b7dd0aaed9f66))

## [3.3.0](https://github.com/eggjs/egg-logger/compare/v3.2.1...v3.3.0) (2023-03-03)


### Features

* add dateISOFormat option ([#88](https://github.com/eggjs/egg-logger/issues/88)) ([14919d8](https://github.com/eggjs/egg-logger/commit/14919d8b878063d04ae13af118c10f0a9234c3e3))

## [3.2.1](https://github.com/eggjs/egg-logger/compare/v3.2.0...v3.2.1) (2023-01-20)


### Bug Fixes

* ctx logger paddingMessage should be a getter ([#86](https://github.com/eggjs/egg-logger/issues/86)) ([5417064](https://github.com/eggjs/egg-logger/commit/5417064b0b313f3f6b1c016072aad5bb9bc17d95))

## [3.2.0](https://github.com/eggjs/egg-logger/compare/v3.1.1...v3.2.0) (2023-01-19)


### Features

* export logger.options type ([#85](https://github.com/eggjs/egg-logger/issues/85)) ([65f3bff](https://github.com/eggjs/egg-logger/commit/65f3bff495a53d8b5551afe4c19c0f2ee57e1bcd))

## [3.1.1](https://github.com/eggjs/egg-logger/compare/v3.1.0...v3.1.1) (2023-01-13)


### Bug Fixes

* use util.debuglog instead of debug module ([#84](https://github.com/eggjs/egg-logger/issues/84)) ([3a5124e](https://github.com/eggjs/egg-logger/commit/3a5124e917b340501127236540273d9839305ce2))

## [3.1.0](https://github.com/eggjs/egg-logger/compare/v3.0.1...v3.1.0) (2023-01-12)


### Features

* allow custom format paddingMessage ([#83](https://github.com/eggjs/egg-logger/issues/83)) ([2ac591a](https://github.com/eggjs/egg-logger/commit/2ac591a1f76f49af5028c9fa6b0bc4c6679ce85e))

---


3.0.1 / 2022-12-10
==================

**fixes**
  * [[`1bd4715`](http://github.com/eggjs/egg-logger/commit/1bd4715d617874373f3d750f4de7e0d8fb3b2653)] - 🐛 FIX: Add localStorage options to EggLoggers (#81) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`804ff20`](http://github.com/eggjs/egg-logger/commit/804ff2024f92c6f4da2182a4afec4b506da2f805)] - 📖 DOC: Update contributors (fengmk2 <<fengmk2@gmail.com>>)

3.0.0 / 2022-12-10
==================

**features**
  * [[`0d4c55d`](http://github.com/eggjs/egg-logger/commit/0d4c55d37e1569950856832b56dbc187df677bf8)] - 📦 NEW: [BREAKING] support asyncLocalStorage to get ctx (#80) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`5776bad`](http://github.com/eggjs/egg-logger/commit/5776bad40f57d04fb73dd852eb69b6b3947c8a8a)] - Create codeql.yml (fengmk2 <<fengmk2@gmail.com>>)

2.9.1 / 2022-11-15
==================

**fixes**
  * [[`ec97edd`](http://github.com/eggjs/egg-logger/commit/ec97edd6d165f559f8c86bf1573cd183b156fd06)] - 🐛 FIX: Ignore error log after stream close on unittest env (#79) (fengmk2 <<fengmk2@gmail.com>>)

2.9.0 / 2022-07-27
==================

**features**
  * [[`493a595`](http://github.com/eggjs/egg-logger/commit/493a5952a4a7c5314a457099a9e9adfd1d1525ce)] - feat: support custom concentrateLoggerName options (#78) (mansonchor.github.com <<mansonchor1987@gmail.com>>)

2.8.0 / 2022-03-22
==================

**features**
  * [[`6f7dcbb`](http://github.com/eggjs/egg-logger/commit/6f7dcbb1ec92b0242c5adc43a41681c3848d4c62)] - feat: Only output logs in JSON file format is supported (#77) (duqingyu <<1065161421@qq.com>>)

2.7.1 / 2021-12-30
==================

**fixes**
  * [[`fe93575`](http://github.com/eggjs/egg-logger/commit/fe935752579ddbf60c6125999faa250ba36e3c35)] - fix: EggLoggers constructor typing (#75) (Lockonlin <<531244799@qq.com>>)

2.7.0 / 2021-12-05
==================

**features**
  * [[`f42cb95`](http://github.com/eggjs/egg-logger/commit/f42cb950ab7e00872c464cff87e7b2b77da5c391)] - feat: support performance timer for more precise milliseconds (#74) (fengmk2 <<fengmk2@gmail.com>>)

2.6.2 / 2021-08-02
==================

**fixes**
  * [[`62d724f`](http://github.com/eggjs/egg-logger/commit/62d724fc2b4b2a22c2d554dbfc4c882b766ed630)] - fix: remove defineProperty to improve performance (#72) (Yiyu He <<dead_horse@qq.com>>)

2.6.1 / 2021-04-07
==================

**fixes**
  * [[`0d3d4e4`](http://github.com/eggjs/egg-logger/commit/0d3d4e461d802340ec989897694c9f9af07b4f3e)] - fix: use FrameworkBaseError.isFrameworkError to judge (#71) (mansonchor.github.com <<mansonchor1987@gmail.com>>)

2.6.0 / 2021-03-23
==================

**features**
  * [[`d414828`](http://github.com/eggjs/egg-logger/commit/d414828d6e511c2be6be7586380ecb917281c238)] - feat: logger formatError should support FrameworkErrorFormater (#70) (mansonchor.github.com <<mansonchor@126.com>>)

**others**
  * [[`33e1e74`](http://github.com/eggjs/egg-logger/commit/33e1e743d932a1897a2588ba5d4c64f05ce9d437)] - refactor: new Buffer() API refactor (#69) (mansonchor.github.com <<mansonchor@126.com>>)
  * [[`5303d31`](http://github.com/eggjs/egg-logger/commit/5303d31bc1512e85561e000836143bc7daae20d9)] - test: only run tests on github actions (#68) (fengmk2 <<fengmk2@gmail.com>>)

2.5.0 / 2021-02-11
==================

**features**
  * [[`81e2328`](http://github.com/eggjs/egg-logger/commit/81e2328a76fc26a4f9a1df0915127ad9e17600ec)] - feat: support console logger default level on env (#67) (lx <<lix059@gmail.com>>)

**others**
  * [[`f987c06`](http://github.com/eggjs/egg-logger/commit/f987c0621b6b272ba9d56caa8af59b65c1251930)] - chore: github action (#63) (TZ | 天猪 <<atian25@qq.com>>)

2.4.2 / 2020-04-14
==================

**others**
  * [[`6fbe6c3`](http://github.com/eggjs/egg-logger/commit/6fbe6c34b7456c683342a51e360f667128afe315)] - chore(typings): add concentrateError to EggLoggerOptions (#62) (scott <<congyuandong@gmail.com>>)
  * [[`a1b6c85`](http://github.com/eggjs/egg-logger/commit/a1b6c85ad13f7fa39dc3fc72029c39604b05cd69)] - chore: update travis (#60) (TZ | 天猪 <<atian25@qq.com>>)

2.4.1 / 2019-03-19
==================

**fixes**
  * [[`d048015`](http://github.com/eggjs/egg-logger/commit/d048015f63dde2917cb51f8f30b87a320b2d892b)] - fix: duplicate should ignore some transports (#45) (TZ | 天猪 <<atian25@qq.com>>)

2.4.0 / 2019-03-14
==================

**features**
  * [[`0cbbe47`](http://github.com/eggjs/egg-logger/commit/0cbbe47efb10897ac55a892bc670d3924a1ddfb5)] - feat: support contextFormatter (#51) (Haoliang Gao <<sakura9515@gmail.com>>)

2.3.2 / 2019-02-28
==================

**fixes**
  * [[`f51216b`](http://github.com/eggjs/egg-logger/commit/f51216bd84d48f75e44ebe2e1208c308d1969dce)] - fix: crash when format a getter-only error stack (#50) (Khaidi Chu <<i@2333.moe>>)

**others**
  * [[`858a8b4`](http://github.com/eggjs/egg-logger/commit/858a8b46495fed21efb4215e36764b3030e573ee)] - chore: comments typo fix (#47) (Jeff <<jeff.tian@outlook.com>>)

2.3.1 / 2019-01-03
==================

  * fix: should not duplicate to console (#43)
  * chore: modify engine version (#42)

2.3.0 / 2019-01-01
==================

**features**
  * [[`22cf355`](http://github.com/eggjs/egg-logger/commit/22cf355d7ae976c8502745a8e8d73748af885637)] - feat: file path support relative path (#41) (TZ | 天猪 <<atian25@qq.com>>)

**others**
  * [[`0262ac2`](http://github.com/eggjs/egg-logger/commit/0262ac204826f1a582bd63273a43cfe86c723ad3)] - chore: fix typo (#40) (Jeff <<jeff.tian@outlook.com>>)

2.2.1 / 2018-12-26
==================

  * fix: logger should extend Map (#39)

2.2.0 / 2018-12-17
==================

**features**
  * [[`d578857`](http://github.com/eggjs/egg-logger/commit/d57885737c4311f17a76713abcd5459523ff92a4)] - feat: support concentrateError and set default to duplicate (#38) (TZ | 天猪 <<atian25@qq.com>>)

2.1.0 / 2018-12-07
==================

**features**
  * [[`e43f70c`](http://github.com/eggjs/egg-logger/commit/e43f70ce6f8b894a110e17384d445edcd44fcff5)] - feat: redirect support `options.duplicate` (#35) (TZ | 天猪 <<atian25@qq.com>>)

2.0.3 / 2018-11-19
==================

**others**
  * [[`6941e1e`](http://github.com/eggjs/egg-logger/commit/6941e1eb0723c907031ea573b08b90e730a99b7c)] - deps: use circular-json-for-egg to remove deprecate message (#33) (Yiyu He <<dead_horse@qq.com>>)

2.0.2 / 2018-10-18
==================

**fixes**
  * [[`1f5684f`](http://github.com/eggjs/egg-logger/commit/1f5684f54a87464748f3acf6699d6fe31e9f4014)] - fix: implicit-any error for EggLoggers#set (#31) (Andy <<anhans@microsoft.com>>)

2.0.1 / 2018-10-09
==================

**others**
  * [[`7a33960`](http://github.com/eggjs/egg-logger/commit/7a33960e9a87de5d693d4628f2f3a7a8de649a33)] - chore: change commemts in english (dead-horse <<dead_horse@qq.com>>)
  * [[`44bd5fa`](http://github.com/eggjs/egg-logger/commit/44bd5fa72fb482dc57f57e2d46150bfa3d72c3cb)] - chore(typings): add LoggerOptions['allowDebugAtProd']: boolean (#28) (waiting <<waiting@xiaozhong.biz>>)

2.0.0 / 2018-10-08
==================

**fixes**
  * [[`0296646`](http://github.com/eggjs/egg-logger/commit/0296646f1dd9f39925ed7e353cc22879ac851a1f)] - fix: don't write when stream is not writable (#30) (Yiyu He <<dead_horse@qq.com>>)

**others**
  * [[`07f3635`](http://github.com/eggjs/egg-logger/commit/07f3635dc05574a926a222b48e4b6d5ec97453e0)] - deps: pin circular-json@0.5.5, update dependencies (#29) (Yiyu He <<dead_horse@qq.com>>)

1.7.1 / 2018-07-09
==================

**fixes**
  * [[`b80560b`](http://github.com/eggjs/egg-logger/commit/b80560b1906ff667db24345029ac8951622ebe59)] - fix: use circular-json to format error properties (#26) (Yiyu He <<dead_horse@qq.com>>)

1.7.0 / 2018-06-21
==================

**features**
  * [[`faf458c`](http://github.com/eggjs/egg-logger/commit/faf458c044b7b49e8aa6cf1d2030111ac58f31ad)] - feat(typings): add typings for egg logger (#24) (Axes <<whxaxes@qq.com>>)

1.6.2 / 2018-04-08
==================

**fixes**
  * [[`4669bbe`](http://github.com/eggjs/egg-logger/commit/4669bbeadded1901320285de0725b3b77da5d52d)] - fix: inspect use breakLength: Infinity (#23) (Yiyu He <<dead_horse@qq.com>>)

1.6.1 / 2017-12-27
==================

**fixes**
  * [[`f0bf7d9`](http://github.com/eggjs/egg-logger/commit/f0bf7d97e269da3ff29f2a6f811f1b48558fbcab)] - fix(transport): should reload write stream when stream get error (#21) (Haoliang Gao <<sakura9515@gmail.com>>)

1.6.0 / 2017-04-28
==================

  * feat: add level getter to Logger and Transport (#19)

1.5.0 / 2016-12-08
==================

  * improve: don't convert utf8 string to buffer (#15)

1.4.1 / 2016-11-11
==================

  * refactor: use .close instead of .end (#12)
  * fix: print to stderr when stream closed (#11)

1.4.0 / 2016-11-02
==================

  * feat: write support util.format (#10)

1.3.0 / 2016-09-21
==================

  * feat: add .unredirect() for logger (#9)
  * use Infinity to improve performance and semantics (#7)

1.2.0 / 2016-08-11
==================

  * feat: remove fileTransport from consoleLogger (#6)

1.1.1 / 2016-08-10
==================

  * fix: add missing write function on context logger (#5)

1.1.0 / 2016-07-27
==================

  * feat: display all error properties (#4)

1.0.1 / 2016-07-09
==================

  * first version
