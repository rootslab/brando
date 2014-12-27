/*
 * Transform Stream for Full Range Permutations, no repetitions.
 */

module.exports = ( function () {

    var log = console.log
        , min = Math.min
        , util = require( 'util' )
        , SeqTransStream = require( './sequence-transform' )
        , FPTransStream = function ( i, r, opt ) {
            var me = this
                , is = me instanceof FPTransStream
                ;
            if ( ! is ) return new FPTransStream( i, r, opt );
            // i should be <= r
            i = min( i, r );
            // call parent constructor
            SeqTransStream.call( me, i, r, opt );
        }
        , fptsproto = null
        ;

    util.inherits( FPTransStream, SeqTransStream );

    fptsproto = FPTransStream.prototype;

    fptsproto._transform = function ( data, encoding, done ) {
        // TODO
    };

    fptsproto._flush = function ( done ) {
        var me = this
            , parent = me.constructor.super_.prototype
            ;
        //TODO

        // call parent _flush method, it calls done()
        parent._flush.call( me, done );
    };

    return FPTransStream;

} )();