/*
 * Full Range Permutation, no repetitions.
 */

module.exports = ( function () {

    var log = console.log
        , Sequence = require( './sequence' )
        , util = require( 'util' )
        , Bice = require( 'bice' )
        , Toni = require( 'toni' )
        , swap = Bice.swap
        , FullPerm = function ( i ) {
            var me = this
                ;
            me.constructor.super_.call( me, i, i );
            me.repeat = 1;
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