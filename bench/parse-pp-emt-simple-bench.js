var log = console.log
    , floor = Math.floor
    , random = Math.random
    , PartPerm = require( '../lib/filters/emitters/partperm' )
    , test = function ( mbytes, items, range ) {
        var mb = Math.max( mbytes, 1 )
            , b = new Buffer( mb * 1024 * 1024 )
            , i = items >>> 0
            , r = range >>> 0
            , pp = new PartPerm( i, r )
            , stime = -1
            , etime = -1
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

        log( '\n- filling test buffer with %d bits values (%d MB)..', pp.ibits, mb );

        for ( ; k <= b.length - pp.ibytes; k += pp.ibytes ) b[ pp.wuint ]( floor( random() * ( 1 << pp.ibits ) ), k );

        pp.once( 'feed', onFeed );
        pp.once( 'fart', onFart );

        log( '- range: [%d, %d]..', 0, r - 1 );
        log( '- items: %d', i );
        log( '- parsing test buffer.' );

        stime = Date.now();

        pp.parse( b );

    };

// 24 bits numbers, 3 bytes

test( 16, 896 * 1024, 1024 * 1024 );
test( 8, 768 * 1024, 1024 * 1024 );
test( 8, 512 * 1024, 1024 * 1024 );
test( 8, 128 * 1024, 1024 * 1024 );
test( 8, 1024, 1024 * 1024 );

test( 8, 768 * 1024, 1024 * 1024 + 1);
test( 8, 512 * 1024, 1024 * 1024 + 1 );
test( 8, 128 * 1024, 1024 * 1024 + 1 );
test( 8, 512 * 1024, 1024 * 1024 + 1 );

log();