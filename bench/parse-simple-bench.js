var log = console.log
    , Brando = require( '../' )
    , Sequence = require( '../lib/filters/sequence' )
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
                log( ' :feed, need other %d bytes, used: %d%', bytes, ( used_ratio * 100 ).toFixed( 2 ) );
            }
            , onFart = function ( result, used_ratio ) {
                etime = Date.now();
                log( '  :fart %d bytes, used: %d%', result.length, ( used_ratio * 100 ).toFixed( 2 ) );
                log( '- parsed result in: %d s\n', ( etime - stime ) / 1000 );
            }
            ;

        log( '\n- filling test buffer (%d MB)..', mb );

        for ( ; k < b.length; ++k ) b[ k ] = 0xe0 + k;

        seq.once( 'feed', onFeed );
        seq.once( 'fart', onFart );

        log( '- range: [%d, %d]..', 0, r - 1 );
        log( '- items: %d', i );
        log( '- parsing test buffer.' );

        stime = Date.now();

        seq.parse( b );

    };

test( 8, 64 * 1024, 33 );
test( 8, 64 * 1024, 32 );
test( 8, 64 * 1024, 28 );


log();