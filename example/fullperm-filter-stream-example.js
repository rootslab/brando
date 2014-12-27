var log = console.log
    , Brando = require( '../' )
    , fs = require( 'fs' )
    , input = fs.createReadStream( './example/test-data.txt' )
    , fpts = new require( '../lib/filters/streams/fullperm-transform' )( 2, 7, {} )
    , dstream = input.pipe( fpts )
    , onRead = function () {
        var me = this
            , data = null
            ;
        while ( data = me.read() ) log( 'data:', data );
    }
    , onEnd = function () {
        var me = this
            ;
        log( 'end' );
    }
    ;

dstream.on( 'readable', onRead );
dstream.on( 'end', onEnd );
