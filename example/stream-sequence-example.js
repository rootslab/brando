var log = console.log
    , fs = require( 'fs' )
    , input = fs.createReadStream( './example/sample' )
    /*
     * Read 33 values in the range 0-9, use items === 0 to
     * read all data from the input source, until it ends.
     */
    , sts = new require( '../lib/filters/streams/sequence-transform' )( 33, 10, {} )
    , dstream = input.pipe( sts )
    , onRead = function () {
        var me = this
            , data = null
            ;
        while ( data = me.read( 7 ) ) log( 'data:', data );
    }
    , onEnd = function () {
        log( 'end' );
    }
    ;

dstream.on( 'readable', onRead );
dstream.on( 'end', onEnd );