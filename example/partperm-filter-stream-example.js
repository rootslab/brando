var log = console.log
    , Brando = require( '../' )
    , fs = require( 'fs' )
    , input = fs.createReadStream( './example/test-data.txt' )
    , ppts = new require( '../lib/filters/streams/partperm-transform' )( 7, 10, {} )
    , dstream = input.pipe( ppts )
    , onRead = function () {
        var me = this
            , data = null
            ;
        while ( data = me.read(3) ) log( 'data:', data );
    }
    , onEnd = function () {
        var me = this
            ;
        log( 'end' );
    }
    ;

dstream.on( 'readable', onRead );
dstream.on( 'end', onEnd );
