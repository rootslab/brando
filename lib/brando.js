/*
 * Brando.
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
        // mask to appy for restricting items
        // , imask = 0xffffffff
        ;
    return {

        get : function ( items, range, repeat ) {
            // normalize values to 32 bits
            var i = ( abs( + items ) >>> 0 ) || 1
                , r = ( abs( + range ) >>> 0 ) || 1
                , seq = repeat !== 1
                ;
            // restrict items with mask: i &= imask;
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
            // restrict items with mask : i &= imask;
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
                , print = function ( val ) {
                    var gb = val >>> 30
                        , mb = val >>> 20
                        , kb = val >>> 10
                        ;
                    if ( gb ) return ( val / ( 1024 * 1024 * 1024 ) ).toFixed( 2 ) + ' GB';
                    if ( mb ) return ( val / ( 1024 * 1024 ) ).toFixed( 2 ) + ' MB';
                    if ( kb ) return ( val / 1024 ).toFixed( 2 ) + ' KB';
                    return val + ' bytes';
                }
                ;

            log( '- items:', i );
            log( '- range:', r );

            if ( seq ) {
                log( '- type: random sequence' );
                log( '- repeat:', + Infinity );
                size = i * ibytes;
                log( '- size: ' + print( size ) );
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
                log( '- size: ' + print( size ) );
            }

            if ( i < r ) {
                log( '- type: partial range permutation' );
                if ( i >= ( ( r * 2 ) / 3 ) ) {
                    log( '- warning:' );
                    log( '  - items >= (range * %d)', ( 2 / 3 ).toFixed( 3 ) );
                    log( '  - limit is %d', ceil( range * 2 / 3 ) );
                    log( '  - use a full permutation!' );
                }
                log( '- repeat:', 1 );
                size = i * ibytes;
                log( '- size: ' + print( size ) );
                log( '- bitmap: ' + print( size >>> 3 ) );
                log( '- total size: ' + print( size + ( size >>> 3 ) ) );
            }

        }

    };

} )();