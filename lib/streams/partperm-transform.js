/*
 * Transform Stream for Partial Range Permutations, no repetitions.
 */

module.exports = ( function () {

    var log = console.log
        , abs = Math.abs
        , ceil = Math.ceil
        , dlog = Math.log
        , floor = Math.floor
        , max = Math.max
        , random = Math.random
        , log2 = dlog( 2 )
        , util = require( 'util' )
        , stream = require( 'stream' )
        , Bolgia = require( 'bolgia' )
        , Bice = require( 'bice' )
        , compare = Bice.compare
        , swap = Bice.swap
        , clone = Bolgia.clone
        , improve = Bolgia.improve
        // masks for cut bits out of current range
        , masks = new Buffer( [ 0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07, 0x03, 0x01 ] )
        // stream default options
        , stream_opt = {
            highWaterMark : 16 * 1024
            , encoding : null
            , objectMode : false
        }
        , PPTransStream = function ( i, r, opt ) {
            var me = this
                , is = me instanceof PPTransStream
                ;
            if ( ! is ) return new PPTransStream( i, r, opt );

            // me.constructor.super_.call( me, improve( clone( opt ), stream_opt ) );

        }
        , pptsproto = null
        ;

    // util.inherits( PPTransStream, stream.Transform );

    pptsproto = PPTransStream.prototype;

    pptsproto._transform = function ( data, encoding, done ) {
    };

    pptsproto._flush = function ( done ) {
    };

    return PPTransStream;

} )();