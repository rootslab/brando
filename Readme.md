### Brando

[![NPM VERSION](http://img.shields.io/npm/v/brando.svg?style=flat)](https://www.npmjs.org/package/brando)
[![CODACY BADGE](https://img.shields.io/codacy/b18ed7d95b0a4707a0ff7b88b30d3def.svg?style=flat)](https://www.codacy.com/public/44gatti/brando)
[![CODECLIMATE](http://img.shields.io/codeclimate/github/rootslab/brando.svg?style=flat)](https://codeclimate.com/github/rootslab/brando)
[![CODECLIMATE-TEST-COVERAGE](https://img.shields.io/codeclimate/coverage/github/rootslab/brando.svg?style=flat)](https://codeclimate.com/github/rootslab/brando)
[![LICENSE](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/rootslab/brando#mit-license)

[![TRAVIS CI BUILD](http://img.shields.io/travis/rootslab/brando.svg?style=flat)](http://travis-ci.org/rootslab/brando)
[![BUILD STATUS](http://img.shields.io/david/rootslab/brando.svg?style=flat)](https://david-dm.org/rootslab/brando)
[![DEVDEPENDENCY STATUS](http://img.shields.io/david/dev/rootslab/brando.svg?style=flat)](https://david-dm.org/rootslab/brando#info=devDependencies)
[![NPM DOWNLOADS](http://img.shields.io/npm/dm/brando.svg?style=flat)](http://npm-stat.com/charts.html?package=brando)

[![NPM GRAPH1](https://nodei.co/npm-dl/brando.png)](https://nodei.co/npm/brando/)

[![NPM GRAPH2](https://nodei.co/npm/brando.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/brando/)

[![status](https://sourcegraph.com/api/repos/github.com/rootslab/brando/.badges/status.png)](https://sourcegraph.com/github.com/rootslab/brando)
[![views](https://sourcegraph.com/api/repos/github.com/rootslab/brando/.counters/views.png)](https://sourcegraph.com/github.com/rootslab/brando)
[![views 24h](https://sourcegraph.com/api/repos/github.com/rootslab/brando/.counters/views-24h.png)](https://sourcegraph.com/github.com/rootslab/brando)

> __Brando__ is a module to handle __pseudo-random sequences/permutations__ of integers using Buffers.

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

###Run Benchmarks

> run miscellaneous benchmarks for Brando

```bash
 $ cd brando/
 $ npm run bench
```
----------------------------------------------------------------------------------------------

###Methods

> Arguments within [ ] are optional.

####Brando.sham

> Print some informational numbers about a particular sequence or permutation,
> without creating anything.

```javascript
Brando#sham : function ( Number items, Number range [, Number repeat ] ) : undefined
```

####Brando.emt

> A simple factory method, it returns an EventEmitter that parses random data and emits results
> with the number of selected items and within the selected range (__unsigned integers__). Internally,
> it creates an empty Buffer of the length necessary to hold all requested values, thent is possible
> to fill it with values generated through Math.Random (biased result) or through a random source
> of data.

> __NOTE:__ If repetition is off, it returns a [Sequence](lib/filters/emitters/sequence), otherwise, when items value is equal to range, it returns a [FullPerm](lib/filters/emitters/fullperm), otherwise a [PartPerm](lib/filters/emitters/partperm).

```javascript
/*
 * For default, repeat = +Infinity, or unlimited repetitions.
 *
 * - if repeat === 1
 *   - if items >= range, it returns a FullPerm.
 *   - if items < range, a PartPerm.
 *
 * - otherwise, it returns a Sequence (unlimited repetitions).
 *
 * Every instance of the Sequence EventEmitter, has 3 methods:
 * 
 * - for filling the Buffer with Math.random:
 *
 *   Sequence#fill : function () : Sequence
 *
 * - for executing multiple times a Fisher-Yates shuffle (using Math.random)
 *
 *   Sequence#shuffle : function ( [ Number times ] ) : Sequence
 *
 * - before reusing Sequence, resetting internal status and/or set a new result buffer:
 *
 *   Sequence#clear : function ( [ Boolean trash [, Boolean refill ] ] ) : Sequence
 *
 * - for parsing input data from a random source:
 *
 *   Sequence#parse : function ( Buffer data ) : undefined
 *
 * - using #parse, Sequence emits:
 *   - 'feed' when needs more data: function ( Number miss_bytes, Number curr_usage_ratio )
 *   - 'fart' when result is ready: function ( Buffer result, Number curr_usage_ratio )
 */
Brando#emt : function ( Number items, Number range [, Number repeat ] ) : Sequence
```
> __NOTE__:
> - max allowed value for items and range is __2^(32)-1__, or __4 bytes__ values.
> - max output size for sequences is __16GB__. Virtually, there is no size limit
>   for sequences with repetitions, but the max length for __FP__ and __PP__ is limited
>   to:
>   - ( __2^32__ values ) * ( __4__ bytes/value ), or __16GB__.

> See also __[emitter examples](example/)__.

------------------------------------------------------------------------------------

####Transform Streams

> Use a Transform stream to consume random data from an input source, it outputs
> results within the selected _range_ of values, limiting the number to _items_.

####Brando.stream

> A simple factory method, it returns a _[SeqTransStream](lib/filters/streams/sequence-transform)_
> (_stream.Transform_), or a sub-type between _[FPTransStream](lib/filters/streams/fullperm-transform)_
> and _[PPTransStream](lib/filters/streams/partperm-transform)_.

```javascript
/*
 * For default, repeat = +Infinity, or unlimited repetitions.
 *
 * - if repeat === 1, it returns a stream that filters a full or a partial permutation.
 *   - if items >= range, it returns a FPTransStream.
 *   - if items < range, a PPTransStream.
 *
 * - otherwise, it returns a SeqTransStream (unlimited repetitions).
 *   - if items === 0, the stream consume all data that it receives, until stream ends.
 *
 * - for default, stream_opt is:
 * {
 *  highWaterMark : 16 * 1024
 *  , encoding : null
 *  , objectMode : false
 }
 */
Brando#stream : function ( Number items, Number range [, Number repeat [, Object stream_opt ] ] ) : SeqTransStream
```
> __NOTE__:
>  - __How many bytes will be consumed__ to produce 1 byte of result, __depends on many factors__,
>   items, range, repetition, but __moreover on the quality of random data__, parsed from the input
>   source to pipe in.

> See also __[stream examples](example/)__.


### MIT License

> Copyright (c) 2015 &lt; Guglielmo Ferri : 44gatti@gmail.com &gt;

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