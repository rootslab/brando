var log = console.log
    , floor = Math.floor
    , random = Math.random
    , Sequence = require( '../lib/filters/emitters/sequence' )
    , test = function ( mbytes, items, range ) {
        var mb = Math.max( mbytes, 1 )
            , b = new Buffer( mb * 1024 * 1024 )
            , r = range >>> 0
            , i = items >>> 0

            , seq = new Sequence( i, r )
            , stime = -1
            , etime= -1
            , k = 0
            , onFeed = function ( bytes, used_ratio ) {
                log( ' :feed, need other %d bytes, consumed: %d%', bytes, ( used_ratio * 100 ).toFixed( 2 ) );
            }
            , onFart = function ( result, used_ratio ) {
                etime = Date.now();
                log( '  :fart %d bytes, consumed: %d%', result.length, ( used_ratio * 100 ).toFixed( 2 ) );
                log( '- parsed result in: %d s\n', ( etime - stime ) / 1000 );
            }
            ;

        log( '\n- filling test buffer with %d bits values (%d MB)..', seq.ibits, mb );

        for ( ; k <= b.length - seq.ibytes; k += seq.ibytes ) b[ seq.wuint ]( floor( random() * ( 1 << seq.ibits ) ), k );

        seq.once( 'feed', onFeed );
        seq.once( 'fart', onFart );

        log( '- range: [%d, %d]..', 0, r - 1 );
        log( '- items: %d', i );
        log( '- parsing test buffer.' );

        stime = Date.now();

        seq.parse( b );

    };

// 24 bits numbers, 3 bytes

test( 8, 1024 * 1024, 1024 * 1024 + 1 );
test( 8, 1024 * 1024, 1024 * 257 );
test( 6, 1024 * 1024, 1024 * 360 );
test( 4, 1024 * 1024, 1024 * 1024 );
test( 4, 1024 * 1024, 1024 * 256 );

// 8 bits numbers, 1 byte

test( 6, 1024 * 1024, 256 );
test( 6, 1024 * 1024, 128 );
test( 6, 1024 * 1024, 129 );

log();