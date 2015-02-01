var log = console.log
    , fs = require( 'fs' )
    , input = fs.createReadStream( './example/sample' )
    , fpts = new require( '../lib/filters/streams/fullperm-transform' )( 3, 20, {} )
    , dstream = input.pipe( fpts )
    , onRead = function () {
        var me = this
            , data = null
            , rbytes
            ;
        /*
         * When read_bytes is undefined, it streams 3 items at a time, see constructor,
         * otherwise, if specified, it reads rbytes bytes, as usual.
         * When items === range or items === 0, it streams/emits full results when all
         * values are permuted; then, specifying items, permits to reduce internal Buffer
         * size for the transform stream; it emits and slices out, a portion (i*ibytes)
         * of Buffer results, once those values are in their definitive place.
         */
        while ( data = me.read( rbytes ) ) log( 'data:', data );
    }
    , onEnd = function () {
        log( 'end' );
    }
    ;

dstream.on( 'readable', onRead );
dstream.on( 'end', onEnd );
