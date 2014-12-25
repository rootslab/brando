### Brando

[![NPM VERSION](http://img.shields.io/npm/v/brando.svg)](https://www.npmjs.org/package/brando)
[![CODACY BADGE](https://img.shields.io/codacy/b18ed7d95b0a4707a0ff7b88b30d3def.svg)](https://www.codacy.com/public/44gatti/brando)
[![CODECLIMATE-TEST-COVERAGE](https://codeclimate.com/github/rootslab/brando/badges/coverage.svg)](https://codeclimate.com/github/rootslab/brando)
[![LICENSE](http://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/rootslab/brando#mit-license)

[![TRAVIS CI BUILD](http://img.shields.io/travis/rootslab/brando.svg)](http://travis-ci.org/rootslab/brando)
[![BUILD STATUS](http://img.shields.io/david/rootslab/brando.svg)](https://david-dm.org/rootslab/brando)
[![DEVDEPENDENCY STATUS](http://img.shields.io/david/dev/rootslab/brando.svg)](https://david-dm.org/rootslab/brando#info=devDependencies)

[![status](https://sourcegraph.com/api/repos/github.com/rootslab/brando/.badges/status.png)](https://sourcegraph.com/github.com/rootslab/brando)
[![views](https://sourcegraph.com/api/repos/github.com/rootslab/brando/.counters/views.png)](https://sourcegraph.com/github.com/rootslab/brando)
[![views 24h](https://sourcegraph.com/api/repos/github.com/rootslab/brando/.counters/views-24h.png)](https://sourcegraph.com/github.com/rootslab/brando)
[![NPM DOWNLOADS](http://img.shields.io/npm/dm/brando.svg)](http://npm-stat.com/charts.html?package=brando)
[![GITTIP](http://img.shields.io/gittip/rootslab.svg)](https://www.gittip.com/rootslab/)

[![NPM GRAPH1](https://nodei.co/npm-dl/brando.png)](https://nodei.co/npm/brando/)

[![NPM GRAPH2](https://nodei.co/npm/brando.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/brando/)

> __Brando__.

###Install

```bash
$ npm install brando [-g]
```

> __require__:

```javascript
var Brando  = require( 'brando' );
```
###Run Tests

> __to run all test files, install devDependecies:__

```bash
 $ cd brando/
 # install or update devDependecies 
 $ npm install --dev
 # run tests
 $ npm test
```
> __to execute a single test file simply do__:

```bash
 $ node test/file-name.js
```

###Methods

> Arguments within [ ] are optional.

```javascript
/*
 * A simple factory method, it returns a Sequence EventEmitter.
 *
 * NOTE:
 * - max allowed value for items and range is 2^(32) - 1 (4 bytes values).
 * - virtually, there is no size limit for sequence with repetitions, instead,
 *   the max length for full (FP) and partial permutations (PP) is limited to
 *   (2^(32) - 1) values * 2^(2) bytes/values, or 16GB.
 * - unlimited repetitions for items are enabled for default (+Infinity),
 *   otherwise use repeat === 1 to produce a full or a partial range permutation.
 */
Brando#get : function ( Number items, Number range [, Number repeat ] ) : Sequence

/*
 * Print some informational numbers about a particular sequence or permutation,
 * without creating anything.
 */
Brando#sham : function ( Number items, Number range [, Number repeat ] ) : Sequence

/*
 * Like #get, but it returns a Transform stream, see examples.
 */
Brando#stream : function ( Number items, Number range [, Number repeat [, Object stream_opt ] ] ) : SeqTransStream

```

### MIT License

> Copyright (c) 2014 &lt; Guglielmo Ferri : 44gatti@gmail.com &gt;

> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:

> __The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.__

> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[![GA](https://ga-beacon.appspot.com/UA-53998692-1/brando/Readme?pixel)](https://github.com/igrigorik/ga-beacon)