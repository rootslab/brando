var log = console.log
    , floor = Math.floor
    , random = Math.random
    , FullPerm = require( '../lib/filters/emitters/fullperm' )
    , test = function ( mbytes, items ) {
        var mb = Math.max( mbytes, 1 )
            , b = new Buffer( mb * 1024 * 1024 )
            , i = items >>> 0
            , fp = new FullPerm( i )
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

        log( '\n- filling test buffer with %d bits values (%d MB)..', fp.ibits, mb );

        for ( ; k <= b.length - fp.ibytes; k += fp.ibytes ) b[ fp.wuint ]( floor( random() * ( 1 << fp.ibits ) ), k );

        fp.once( 'feed', onFeed );
        fp.once( 'fart', onFart );

        log( '- range: [%d, %d]..', 0, i - 1 );
        log( '- items: %d', i );
        log( '- parsing test buffer.' );

        stime = Date.now();

        fp.parse( b );

    };

// 24 bits numbers, 3 bytes

test( 8, 1024 * 1024 + 1 );
test( 6, 1024 * 1024 );

// 8 bits numbers, 1 byte

test( 1, 256 );
test( 1, 128 );
test( 1, 129 );

log();