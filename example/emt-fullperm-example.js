/*
 * Example of mimicking the creation and shuffling of a deck of 52 cards,
 * using a full permutation within a range of 52 values, FP(52).
 */

var log = console.log
    , floor = Math.floor
    , random = Math.random
    , buffer = require( 'buffer' )
    , fs = require( 'fs' )
    // load test data from a random sample of 16 KBytes
    , sample_data = fs.readFileSync( './example/sample' )
    , Brando = require( '../' )
    // 
    , rand = function ( min, max ) {
        min = + min || 0;
        max = + max || 0;
        return min + floor( random() * ( max - min + 1 ) );
    }
    , rslice = function ( data ) {
        var dlen = data.length
            ;
        // get random indexes for slicing data, obviously the slice length should be >= 52
        return data.slice( rand( 0, dlen >>> 2 ), rand( dlen >>> 1, dlen ) );
    }
    , cards = 52
    // get a full permutation of 52 items/bytes
    , fp = Brando.emt( cards, cards, 1 )
    , runs = 3
    ;

buffer.INSPECT_MAX_BYTES = 52;

log( '\n- generate a deck of 52 card/values, or a FULL PERMUTATION of 52 values.' );

/*
 * On FP creation, internal buffer is shuffled with Fisher-Yates algorithm,
 * it uses Math.random for selecting numbers (biased results).
 */
log( '\n- FULLPERM(%d) CREATED, SHUFFLE(0) (Fisher-Yates with Math.random):\n', cards, fp.result );

/*
 * Now, parse random data, to produce 4 permutations of internal values;
 * Fisher-Yates algorithm guarantees equiprobability for every permutation,
 * but we still need a source of random data that doesn't produce biased results.
 * Since 52!~= 2^226, it's impossible for a generator with less than 226 bits
 * of internal state to produce all the possible permutations of a 52-card deck.
 *
 * See http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle.
 *
 * NOTE: for FPs, parsing data, it is equivalent to shuffling items, 1 time, with
 * Fisher-Yates algorithm.
 */
fp.on( 'feed', function () {
    // FP needs more data...
} );

fp.on( 'fart', function ( result, ratio ) {
    log( '\n- FULLPERM(%d), SHUFFLE(%d)', fp.items, 4 - runs,'(Fisher-Yates with random source).' );
    log( '  :fart:', fp.result );
    log( '- random values used: %d%\n', ( 100 * ratio ).toFixed( 2 ) );
    /*
     * If you want to use a new buffer for results, filled using
     * Fisher-Yates algorithm and Math.random, use: clear(true, true).
     *
     * - FP#clear( Boolean trash, Boolean refill ) : FP
     *
     */
    fp.clear( false, false );
    // parse another random slice
    if ( runs-- ) fp.parse( rslice( sample_data ) );
} );

// get a random slice of data
fp.parse( rslice( sample_data ) );