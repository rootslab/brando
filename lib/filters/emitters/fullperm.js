/*
 * Full Range Permutation, no repetitions.
 */

module.exports = ( function () {

    if ( ! Buffer.readUInt24LE ) require( '../utils/buffer' );

    var log = console.log
        , Sequence = require( './sequence' )
        , util = require( 'util' )
        // masks for cut bits out of current range 
        , masks = new Buffer( [ 0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07, 0x03, 0x01 ] )
        , FullPerm = function ( i ) {
            var me = this
                ;
            me.constructor.super_.call( me, i, i );
            // set max repetition to 1
            me.repeat = 1;
            // auto-fill with math.random
            me.fill();
        }
        , fproto = null
        ;

    util.inherits( FullPerm, Sequence );

    fproto = FullPerm.prototype;

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

    // Full range permutations (FP) uses random data only for shuffling the result Buffer.
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
            ;
        for ( ; me.wpos < tbytes; o += ibytes ) {
            if ( o > l ) break;
            data[ o ] &= cmask;
            if ( ( r = data[ ruint ]( o ) ) >= range ) continue;
            result[ wuint]( r, me.wpos );
            me.wpos += ibytes;
        }
        return me.wpos < tbytes ?
               me.emit( 'feed', tbytes - me.wpos, tbytes / o ) :
               me.emit( 'fart', me.result, tbytes / o )
               ;
    };

    return FullPerm;

} )();