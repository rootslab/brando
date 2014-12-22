/*
 * Partial Permutation, no repetitions.
 */

module.exports = ( function () {

    var log = console.log
        , abs = Math.abs
        , floor = Math.floor
        , min = Math.min
        , random = Math.random
        , Sequence = require( './sequence' )
        , util = require( 'util' )
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
        // masks for cut bits out of current range 
        , masks = new Buffer( [ 0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07, 0x03, 0x01 ] )
        , PartPerm = function ( i, r ) {
            var me = this
                // order values, items should be < range
                , items = min( i, r )
                , range = items === r ? i : r
                ;
            me.constructor.super_.call( me, items, range );
            // set max repetitions to 1
            me.repeat = 1;
            // init bitmap property to check items presence if it doesn't exists
            me.bitmap = Toni( range );
        }
        , pproto = null
        ;

    util.inherits( PartPerm, Sequence );

    pproto = PartPerm.prototype;

    pproto.clear = function ( zerofill ) {
        var me = this
            , parent = me.constructor.super_
            , range = me.range
            , bmap = me.bitmap
            ;
        // clear result buffer and bitmap
        parent.prototype.clear.call( me, zerofill );
        if ( bmap instanceof Toni ) bmap.clear();
        else me.bitmap = Toni( { range : range } );;
        return me;
    };

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
            , bmap = me.bitmap
            , pick = rand.bind( me, 0, range - 1)
            , n = pick()
            ;
        // trivial filling with Math.random, it is not properly random..
        for ( ; i < o; n = pick() )
            if ( ~ bmap.add( n ) ) result[ wuint ]( n, i ) & ( i += ibytes );
        return me;
    };

    pproto.parse = function ( data ) {
        var me = this
            , ruint = me.ruint
            , wuint = me.wuint
            , range = me.range
            , bmap = me.bitmap
            , result = me.result
            , tbytes = me.tbytes
            , ibytes = me.ibytes
            , bits = me.bits
            , ibits = me.ibits
            , cmask = masks[ ibits - bits ]
            , dlen = data.length
            , l = dlen - ibytes
            , o = 0
            ;
        for ( ; me.wpos < tbytes; o += ibytes ) {
            if ( o > l ) return me.emit( 'feed', tbytes - me.wpos );
            data[ o ] &= cmask;
            if ( ( ( r = data[ ruint ]( o ) ) < range ) && ~ bmap.add( r ) ) {
                result[ wuint]( r, me.wpos );
                me.wpos += ibytes;
            }
        }
        return me.emit( 'fart', me.result );
    };

    return PartPerm;

} )();