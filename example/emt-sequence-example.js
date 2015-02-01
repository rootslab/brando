var log = console.log
    // , buffer = require( 'buffer' )
    , fs = require( 'fs' )
    , input = fs.createReadStream( './example/sample' )
    , Sequence = require( '../lib/filters/emitters/sequence' )
    // items
    , i = 1024
    // range [0-8]
    , r = 9
    , seq = new Sequence( i, r )
    , onFeed = function ( bytes, used_ratio ) {
        log( ' :feed, need other %d bytes, consumed: %d%', bytes, ( used_ratio * 100 ).toFixed( 2 ) );

    }
    , onFart = function ( result, used_ratio ) {
         log( '  :fart %d bytes, consumed: %d%, buffer:', result.length, ( used_ratio * 100 ).toFixed( 2 ), result );
         log();
    }
    , onRead = function () {
        var data = null
            ;
        if ( data = input.read() ) seq.parse( data );
    }
    ;

/*
 * For random sequences, how many bytes of random data will be consumed, depends primarly
 * on the number of bits used to represent the selected range, for example, the selected
 * range is 9 (0-8), the next power of 2 is 16, then we expect to discard 16-9=7 items,
 * on the average, using 9/16 or ~56.25% of random values to produce requested results;
 * it implies that we expect to consume ~2 bytes of random data for every byte of result.
 *
 * Try to use a power of 2 for range, like 8 or 16, use also 15, 17 and see the different
 * results for random data consumption.
 * See also notes in filters/emitters/sequence.js.
 */

log( '\n- created new sequence with %d items, within range [0,%d]', i, r - 1 );

seq.on( 'feed', onFeed );
seq.on( 'fart', onFart );

log( '- read random data from input source to build random result..' );

// buffer.INSPECT_MAX_BYTES = Infinity;

input.on( 'readable', onRead );