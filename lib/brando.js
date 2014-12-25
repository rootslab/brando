/*
 * Brando.
 *
 * NOTE: Actually, there is no size limit for sequence with repetitions,
 * instead, the max size for full (FP) and partial permutations (PP) is
 * limited to 2^(32) * 2^(2) bytes, or 16GB.
 *
 * Copyright(c) 2014 Guglielmo Ferri <44gatti@gmail.com>
 * MIT Licensed
 */

exports.version = require( '../package' ).version;
exports.Brando = ( function () {
    var log = console.log
        , abs = Math.abs
        , max = Math.max
        , pow = Math.pow
        , ceil = Math.ceil
        , dlog = Math.log
        , log2 = dlog( 2 )
        , random = require( './filters/' )
        , transform = require( './streams/' )
        // change mask for allowing more items (default is max 65535)
        , lmask = 0xffff
        ;
    return {

        get : function ( items, range, repeat ) {
            // normalize values to 32 bits
            var i = ( abs( + items ) >>> 0 ) || 1
                , r = ( abs( + range ) >>> 0 ) || 1
                , seq = repeat !== 1
                ;
            // items are restricted to max 2^(16) - 1.
            i = i & lmask;
            // with no repetition, items should be always <= range
            return seq ? new random.sequence( i, r ) :
                   ( i < r ? new random.partperm( i, r ) :
                   ( i > r ? null : new random.fullperm( i ) ) )
                   ;
        }

        , stream : function ( items, range, repeat, stream_opt ) {
            // normalize values to 32 bits
            var i = ( abs( + items ) >>> 0 ) || 1
                , r = ( abs( + range ) >>> 0 ) || 1
                , seq = repeat !== 1
                ;
            // for default, items are restricted to max 2^(16) - 1.
            i = i & lmask;
            // with no repetition, items should be always <= range
            return seq ? new transform.sequence( i, r, stream_opt ) :
                   ( i < r ? new transform.partperm( i, r, stream_opt ) :
                   ( i > r ? null : new transform.fullperm( i, stream_opt ) ) )
                   ;
        }

        , sham : function ( items, range, repeat ) {
            var i = ( abs( + items ) >>> 0 ) || 1
                , r = ( abs( + range ) >>> 0 ) || 1
                , seq = repeat !== 1
                , ibits = max( ceil( dlog( r ) / log2 ), 1 )
                , ibytes = max( ceil( ibits / 8 ), 1 )
                , size = -1
                , prod = i * r
                ;

            log( '- items:', i );
            log( '- range:', r );

            // check js limits for numbers
            if ( prod === ++prod ) {
                log( '- type: unknown' );
                log( '- error:' );
                log( '  - items * range > %d', pow( 2, 53 ) );
                log( '  - js could not handle numbers > 2^53' );
                log( '  - decrease items to get reliable size results!' );
                return;
            }

            if ( seq ) {
                log( '- type: random sequence' );
                log( '- repeat:', + Infinity );
                size = i * ibytes;
                log( '- size: %d KBytes', ( size >>> 10 ).toFixed( 2 ) );
                return;
            }

            if ( i > r ) {
                log( '- type: unknown' );
                log( '- error:' );
                log( '  - when repeat is 1, items should be <= range' );
                log( '  - items should be less than %d, now is: %d', r, i );
                log( '  - use a full permutation, or set repetition to 0!' );
                return;
            }

            if ( r === i ) {
                log( '- type: full range permutation' );
                log( '- repeat:', 1 );
                size = i * ibytes;
                log( '- size: %d KBytes', ( size >>> 10 ).toFixed( 2 ) );
            }

            if ( i < r ) {
                log( '- type: partial range permutation' );
                if ( i >= ( ( r * 2 ) / 3 ) ) {
                    log( '- warning:' );
                    log( '  - items >= (range * %d)', ( 2 / 3 ).toFixed( 2 ) );
                    log( '  - limit is %d', ceil( range * 2 / 3 ) );
                    log( '  - use a full permutation!' );
                }
                log( '- repeat:', 1 );
                size = i * ibytes;
                log( '- size: %d KBytes', ( size >>> 10 ).toFixed( 2 ) );
                log( '- bitmap: %d bytes', size >>> 3 );
                log( '- total size: %d Kbytes', ( ( size + ( size >>> 3 ) ) >>> 10 ).toFixed( 2 ) );
            }

        }

    };

} )();