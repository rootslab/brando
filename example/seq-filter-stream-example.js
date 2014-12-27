var log = console.log
    , Brando = require( '../' )
    , fs = require( 'fs' )
    , input = fs.createReadStream( './example/test-data.txt' )
    , sts = new require( '../lib/filters/streams/sequence-transform' )( 16, 10, {} )
    , dstream = input.pipe( sts )
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
