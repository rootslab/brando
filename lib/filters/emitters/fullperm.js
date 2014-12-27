/*
 * EventEmiiter for Full Range Permutations, no repetitions.
 */

module.exports = ( function () {

    if ( ! Buffer.readUInt24LE ) require( '../utils/buffer' );

    var log = console.log
        , max = Math.max
        , ceil = Math.ceil
        , dlog = Math.log
        , log2 = dlog( 2 )
        , util = require( 'util' )
        , Bice = require( 'bice' )
        , Sequence = require( './sequence' )
        , swap = Bice.swap
        , FullPerm = function ( i ) {
            var me = this
                ;
            me.constructor.super_.call( me, i, i );
            // set max repetition to 1
            me.repeat = 1;
            // auto-fill with Math.random, biased results
            me.fill();
            // set write position to last element
            me.wpos = me.tbytes - me.ibytes;
        }
        , fproto = null
        ;

    util.inherits( FullPerm, Sequence );

    fproto = FullPerm.prototype;

    fproto.clear = function ( zerofill ) {
        var me = this
            , parent = me.constructor.super_
            ;
        // clear result buffer and bitmap
        parent.prototype.clear.call( me, zerofill );
        // set write position to last element
        me.wpos = me.tbytes - me.ibytes;
        return me;
    };

    fproto.fill = function () {
        var me = this
            , ibytes = me.ibytes
            , range = me.range
            , tbytes = me.tbytes
            , result = me.result
            , wuint = me.wuint
            , o = tbytes - ibytes + 1
            , i = 0
            ;
        // trivial filling with a (Math.random) shuffle, it is not properly random..
        for ( ; i < o; i += ibytes ) result[ wuint ]( i, i );
       // me.shuffle( 1 );
        return me;
    };

    /*
     * the parse method for full range permutations (FPs), uses the random data
     * only for shuffling the result Buffer, using the Fisher-Yates algorithm.
     * To shuffle r elements (0,r-1):
     *
     * var i = r − 1
     *     , a = [ .. ]
     *     ;
     * for ( ; i; --i ) swap( a[ random( 0, i ) ], a[ i ] );
     *
     * NOTE: random(0,i) should return a number between >=0 && <=i.
     * 
     * CAVE CANEM: I restrict the range of parsed values, on every iteration, to the
     * current writing index (me.wpos) value, applyig a mask; in this manner we have
     * a probability of at least 1/2, to find a good value of on every iteration, then
     * it ensures that the algorithm converges quickly.
     * Otherwise it could run indefinitively, consuming a lot of random data, also to
     * produce only a short-size full range permutation.
     * The bad aspect: it will probably produce more biased results.
     */
    fproto.parse = function ( data ) {
        var me = this
            , ruint = me.ruint
            , wuint = me.wuint
            , result = me.result
            , range = me.range
            , tbytes = me.tbytes
            , ibytes = me.ibytes
            , bits = me.bits
            , ibits = me.ibits
            , cmask = 0xff >>> ( ibits - bits )
            , dlen = data.length
            , l = dlen - ibytes
            , o = 0
            , r = -1
            , wmask = -1
            , wbits = -1
            ;
        for ( ; me.wpos; o += ibytes ) {
            if ( o > l ) break;
            data[ o ] &= cmask;
            // calc bits for mask from me.wpos value
            wbits = max( ceil( dlog( me.wpos ) / log2 ), 1 );
            wmask = ( 1 << wbits >>> 0 ) - 1;
            // apply mask to restrict range of parsed values, prob of success >=~1/2.
            if ( ( r = ( data[ ruint ]( o ) * ibytes ) & wmask ) > me.wpos ) continue;
            swap( result, me.wpos, r, ibytes );
            me.wpos -= ibytes;
        }
        return me.wpos ?
               me.emit( 'feed', me.wpos, tbytes / o ) :
               me.emit( 'fart', me.result, tbytes / o )
               ;
    };

    return FullPerm;

} )();