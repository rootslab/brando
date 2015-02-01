/*
 * Transform Stream for Partial Range Permutations, no repetitions.
 */

module.exports = ( function () {

    var min = Math.min
        , util = require( 'util' )
        , Toni = require( 'toni' )
        , SeqTransStream = require( './sequence-transform' )
        , PPTransStream = function ( i, r, opt ) {
            var me = this
                , is = me instanceof PPTransStream
                ;
            if ( ! is ) return new PPTransStream( i, r, opt );
            // i should be <= r
            i = min( i, r );
            // call parent constructor
            SeqTransStream.call( me, i, r, opt );
            // add bitmap
            me._sequence.bitmap = Toni( r );
        }
        , pptsproto = null
        ;

    util.inherits( PPTransStream, SeqTransStream );

    pptsproto = PPTransStream.prototype;

    pptsproto._transform = function ( data, encoding, done ) {
        var me = this
            , seq = me._sequence
            , ruint = seq.ruint
            , range = seq.range
            , bmap = seq.bitmap
            , ibytes = seq.ibytes
            , cmask = seq.cmask
            , dlen = data.length
            , l = dlen - ibytes
            , o = 0
            , r = 0
            ;
        for ( ; o <= l; o += ibytes ) {
            data[ o ] &= cmask;
            if ( ( ( r = data[ ruint ]( o ) ) < range ) && ~ bmap.add( r ) ) {
                me.push( data.slice( o, o + ibytes ) );
                if ( ( ~ seq.left ) && ( --seq.left === 0 ) ) {
                    // items limit was reached, end the stream
                    me.push( null );
                    break;
                }
            }
        }
        done();
    };

    pptsproto._flush = function ( done ) {
        var me = this
            , parent = me.constructor.super_.prototype
            ;
        // clear bitmap
        me._sequence.bitmap.clear();
        // call parent _flush method, it calls done()
        parent._flush.call( me, done );
    };

    return PPTransStream;

} )();