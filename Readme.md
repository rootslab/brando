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

> __Brando__ _(Cave Canem)_.

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

####Brando.sham

> Print some informational numbers about a particular sequence or permutation,
> without creating anything.

```javascript
Brando#sham : function ( Number items, Number range [, Number repeat ] ) : Sequence
```

####Brando.get

> A simple factory method, it returns a _[Sequence](lib/filters/emitters/sequence)_ (_EventEmitter_), or a type that
> inherits from [Sequence](lib/filters/emitters/sequence), respectively _[FullPerm](lib/filters/emitters/fullperm)_ and _[PartPerm](lib/filters/emitters/partperm)_.

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
 * - for resetting internal status:
 *
 *   Sequence#clear : function ( [ Boolean zerofill ] ) : Sequence
 *
 * - for parsing input data from a random source:
 *
 *   Sequence#parse : function ( Buffer data ) : undefined
 *
 * - using #parse, it emits:
 *   - 'feed' when it needs more random data.
 *   - 'fart' when result is ready.
 */
Brando#get : function ( Number items, Number range [, Number repeat ] ) : Sequence
```
> __NOTE__:
> - max allowed value for items and range is __2^(32)-1__, or __4 bytes__ values.
> - max output size for sequences is __16GB__. Virtually, there is no size limit
>   for sequences with repetitions, but the max length for __FP__ and __PP__ is limited
>   to:
>   - ( __2^32__ values ) * ( __4__ bytes/value ), or __16GB__.

------------------------------------------------------------------------------------

####Transform Streams

> Use a Transform stream to consume random data from an input source, it outputs
> results within the selected _range_ of values, limiting the number to _items_.

> __NOTE__: __How many bytes will be consumed__ to produce 1 byte of result,
> __depends on many factors__, items, range, repetition, but __moreover on the
> quality of random data__, parsed from the input source to pipe in.

> See also [examples](example/).

> A simple factory method, it returns a _[SeqTransStream](lib/filters/streams/sequence-transform)_
> (_stream.Transform_), or a type that inherits from _[SeqTransStream](lib/filters/streams/sequence-transform)_,
> respectively _[FPTransStream](lib/filters/streams/fullperm-transform)_
> and _[PPTransStream](lib/filters/streams/partperm-transform)_.

####Brando.stream

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