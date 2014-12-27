var log = console.log
    , Brando = require( '../' )
    , fs = require( 'fs' )
    , input = fs.createReadStream( './example/test-data.txt' )
    , fpts = new require( '../lib/filters/streams/fullperm-transform' )( 3, 19, {} )
    , dstream = input.pipe( fpts )
    , onRead = function () {
        var me = this
            , data = null
            , rbytes = undefined
            ;
        /*
         * When read_bytes is undefined, it streams 3 items at a time, see constructor,
         * otherwise it reads rbytes bytes, as usual.
         * Specifying items, permits to reduce internal Buffer size for the transform
         * stream; it emits and slices out, a portion (i*ibytes) of Buffer results,
         * once those values are in their definitive place.
         */
        while ( data = me.read( rbytes ) ) log( 'data:', data );
    }
    , onEnd = function () {
        var me = this
            ;
        log( 'end' );
    }
    ;

dstream.on( 'readable', onRead );
dstream.on( 'end', onEnd );
