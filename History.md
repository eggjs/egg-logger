
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
