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
        // masks for cut bits out of current range 
        , masks = new Buffer( [ 0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07, 0x03, 0x01 ] )
        , wmasks = [
            0xffffffff, 0x7fffffff, 0x3fffffff, 0x1fffffff, 0x0fffffff, 0x07ffffff, 0x03ffffff, 0x01ffffff,
            0x00ffffff, 0x007fffff, 0x003fffff, 0x001fffff, 0x000fffff, 0x0007ffff, 0x0003ffff, 0x0001ffff,
            0x0000ffff, 0x00007fff, 0x00003fff, 0x00001fff, 0x00000fff, 0x000007ff, 0x000003ff, 0x000001ff,
            0x000000ff, 0x0000007f, 0x0000003f, 0x0000001f, 0x0000000f, 0x00000007, 0x00000003, 0x00000001
        ]
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
            , cmask = masks[ ibits - bits ]
            , dlen = data.length
            , l = dlen - ibytes
            , o = 0
            , r = -1
            , wmask = -1
            , wbits = -1
            , wibits = -1
            , wibytes = -1
            ;
        
        for ( ; me.wpos; o += ibytes ) {
            if ( o > l ) break;
            data[ o ] &= cmask;
            // calculate mask to apply to parsed values
            wbits = max( ceil( dlog( me.wpos ) / log2 ), 1 );
            wibytes = max( ceil( wbits / 8 ), 1 );
            wibits = wibytes << 3 >>> 0;
            wmask = wmasks[ 32 - wbits ];
            // after reading the value, apply wpos mask
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