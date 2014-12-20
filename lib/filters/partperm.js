/*
 * Partial Permutation, no repetitions.
 */

module.exports = ( function () {

    var log = console.log
        , abs = Math.abs
        , floor = Math.floor
        , random = Math.random
        , Sequence = require( './sequence' )
        , util = require( 'util' )
        , Bice = require( 'bice' )
        , Toni = require( 'toni' )
        , swap = Bice.swap
        /* 
         * It returns a random integer between min and max.
         * Using Math.round() will give you a non-uniform distribution.
         * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
         */
        , rand = function ( min, max ) {
            min = + min || 0;
            max = + max || 0;
            return min + floor( random() * ( max - min + 1 ) );
        }
        , PartPerm = function ( i, r ) {
            var me = this
                // order values, items should be < range
                , items = min( i, r )
                , range = items === r ? i : r
                ;
            me.constructor.super_.call( me, items, range );
            me.repeat = 1;
        }
        , pproto = null
        ;

    util.inherits( PartPerm, Sequence );

    pproto = PartPerm.prototype;

    pproto.fill = function () {
        var me = this
            , range = me.range
            , ibytes = me.ibytes
            , tbytes = me.tbytes
            , result = me.result
            , wuint = me.wuint
            , o = tbytes - ibytes + 1
            , i = 0
            // init a bitmap to check items presence
            , bmap = Toni( { range : range } )
            , pick = rand.bind( me, 0, range - 1)
            , n = pick()
            ;
        // trivial filling with Math.random, it is not properly random..
        for ( ; i < o; n = pick() )
            if ( ~ bmap.add( n ) ) result[ wuint ]( n, i ) & ( i += ibytes );
        return me;
    };

    pproto.in = function ( value ) {
        var me = this
            , bmap = me.bmap
            , r = me.range
            , v = abs( + value )
            , ok = ( bmap instanceof Toni ) && ( v < r ) && ( ~ bmap.add( v ) )
            ;
        return ok ? 1 : -1;
    };

    pproto.parse = function ( data ) {
        var me = this
            , range = me.range
            , bmap = me.bitmap
            ;
        // init bitmap property to check items presence if it doesn't exists
        me.bitmap = bmap || Toni( { range : range } );
        return me;
    };

    return PartPerm;

} )();