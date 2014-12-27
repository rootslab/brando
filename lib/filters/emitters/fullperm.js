/*
 * EventEmiiter for Full Range Permutations, no repetitions.
 *
 * TODO - Fix parse.
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
        me.shuffle( 1 );
        return me;
    };

    /*
     * Full range permutations (FP) uses random data only for shuffling
     * the result Buffer, with Fisher-Yates algorithm.
     *
     * To shuffle r elements (indexes from r - 1 downto 0):
     *
     * var i = r − 1
     *     , a = [ .. ]
     *     ;
     * for ( ; i; --i ) swap( a[ random( 0, i ) ], a[ i ] );
     *
     * random method should return a number >=0 && <=i.
     *
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
            , wbits = .1
            ;
        
        for ( ; me.wpos; o += ibytes ) {
            if ( o > l ) break;
            data[ o ] &= cmask;
            if ( ( r = ( ( data[ ruint ]( o ) ) * ibytes ) ) > me.wpos ) continue;
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