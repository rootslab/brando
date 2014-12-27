/*
 * Transform Stream for Full Range Permutations, no repetitions.
 */

module.exports = ( function () {

    var log = console.log
        , min = Math.min
         , max = Math.max
        , ceil = Math.ceil
        , dlog = Math.log
        , log2 = dlog( 2 )
        , util = require( 'util' )
        , SeqTransStream = require( './sequence-transform' )
        , Bice = require( 'bice' )
        , swap = Bice.swap
        , FPTransStream = function ( i, r, opt ) {
            var me = this
                , is = me instanceof FPTransStream
                ;
            if ( ! is ) return new FPTransStream( i, r, opt );
            // call parent constructor
            SeqTransStream.call( me, r, r, opt );
            // trviial filling
            var seq = me._sequence
                , ibytes = seq.ibytes
                , tbytes = ibytes * seq.items
                , buffer = new Buffer( tbytes )
                , wuint = seq.wuint
                , o = tbytes - ibytes + 1
                , n = 0
                ;
            for ( ; n < o; n += ibytes ) buffer[ wuint ]( n, n );
            // items should always be <= r
            seq.items = min( i, r ) || r;
            // set result property
            seq.result = buffer;
            // set write position to the last element
            seq.wpos = tbytes - ibytes;
        }
        , fptsproto = null
        ;

    util.inherits( FPTransStream, SeqTransStream );

    fptsproto = FPTransStream.prototype;

    fptsproto._transform = function ( data, encoding, done ) {
        var me = this
            , seq = me._sequence
            , ruint = seq.ruint
            , range = seq.range
            , bmap = seq.bitmap
            , ibytes = seq.ibytes
            , result = seq.result
            , cmask = seq.cmask
            , dlen = data.length
            , l = dlen - ibytes
            , o = 0
            , r = -1
            , wmask = -1
            , wbits = -1
            ;
        for ( ; o <= l; o += ibytes ) {
            data[ o ] &= cmask;
            // calc bits for mask from me.wpos value
            wbits = max( ceil( dlog( me.wpos ) / log2 ), 1 );
            wmask = ( 1 << wbits >>> 0 ) - 1;
            // apply mask to restrict range of parsed values, prob of success >=~1/2.
            if ( ( r = ( data[ ruint ]( o ) * ibytes ) & wmask ) > seq.wpos ) continue;
            swap( result, seq.wpos, r, ibytes );
            seq.wpos -= ibytes;
            --seq.left;
            if ( ! seq.wpos ) {
               // limit reached, push result buffer 
               me.push( seq.result );
               // end stream
               me.push( null );
               break;
            }
        }
        done();

    };

    fptsproto._flush = function ( done ) {
        var me = this
            , parent = me.constructor.super_.prototype
            ;
        // call parent _flush method, it calls done()
        parent._flush.call( me, done );
    };

    return FPTransStream;

} )();