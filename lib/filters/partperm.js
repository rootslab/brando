/*
 * Partial Permutation, no repetitions.
 */

module.exports = ( function () {

    var log = console.log
        , abs = Math.abs
        , ceil = Math.ceil
        , dlog = Math.log
        , floor = Math.floor
        , max = Math.max
        , min = Math.min
        , random = Math.random
        , log2 = dlog( 2 )
        , Sequence = require( './sequence' )
        , util = require( 'util' )
        , Bice = require( 'bice' )
        , Toni = require( 'toni' )
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
            // bitmap used when parsing random data
            me.bitmap = null;
        }
        , pproto = null
        ;

    util.inherits( PartPerm, Sequence );

    pproto = PartPerm.prototype;

    fproto.clear = function () {
        var me = this
            , parent = me.constructor.super_
            , bmap = me.bitmap
            ;
        // clear result buffer and bitmap
        parent.prototype.clear.call( me );
        if ( bmap instanceof Toni ) bmap.clear();
        else me.bitmap = null;
        return me;
    };

    pproto.fill = function () {
        var me = this
            , range = me.range
            , ibytes = me.ibytes
            , ubits = ibytes << 3 >>> 0
            , range = me.range
            , tbytes = me.tbytes
            , result = me.result
            // choose appropriate method for writing ints/uints from 8 to 32 bits
            , wuint = [ 'writeUInt' + ubits + ( ibytes > 1 ? 'BE' : '' ) ]
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

    pproto.parse = function () {
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