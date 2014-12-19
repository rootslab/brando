/*
 * Full Range Permutation, no repetitions.
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
        , Sequence = require( './sequence' )
        , util = require( 'util' )
        , Bice = require( 'bice' )
        , Toni = require( 'toni' )
        , FullPerm = function ( i ) {
            var me = this
                ;
            me.constructor.super_.call( me, i, i );
            // bitmap used when parsing random data
            me.bitmap = null;
        }
        , fproto = null
        ;

    util.inherits( FullPerm, Sequence );

    fproto = FullPerm.prototype;

    fproto.fill = function () {
        var me = this
            , ibytes = me.ibytes
            , ubits = ibytes << 3 >>> 0
            , range = me.range
            , tbytes = me.tbytes
            , result = me.result
            // choose appropriate method for writing ints/uints from 8 to 32 bits
            , wuint = [ 'writeUInt' + ubits + ( ibytes > 1 ? 'BE' : '' ) ]
            , o = tbytes - ibytes + 1
            , i = 0
            ;
        // trivial filling with a (Math.random) shuffle, it is not properly random..
        for ( ; i < o; i += ibytes ) result[ wuint ]( i, i );
        me.shuffle( 1 );
        return me;
    };

    fproto.parse = function () {
        var me = this
            , range = me.range
            , bmap = me.bitmap
            ;
        // init bitmap property to check items presence if it doesn't exists
        me.bitmap = bmap || Toni( { range : range } );
        return me;
    };

    return FullPerm;

} )();