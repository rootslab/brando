/*
 * Random Sequence, unlimited repetitions.
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
        , emitter = require( 'events' ).EventEmitter
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
        , Sequence = function ( i, r ) {
            var me = this
                ;
            /*
             * Get how many bits and bytes are necessary to
             * represent values in the specified range, min
             * is 1 byte.
             */
            me.range = r >>> 0 ? abs( r ) : 1;
            me.items = i >>> 0 ? abs( i ) : 1;
            me.repeat = Infinity;
            me.bits = max( ceil( dlog( me.range ) / log2 ), 1 );
            me.ibytes = max( ceil( me.bits / 8 ), 1 );
            me.ibits = me.ibytes << 3 >>> 0;
            me.tbytes = me.ibytes * me.items;
            // choose appropriate method for reading/writing ints/uints from 8 to 32 bits
            me.ruint = [ 'readUInt' + me.ibits + ( me.ibytes > 1 ? 'BE' : '' ) ]
            me.wuint = [ 'writeUInt' + me.ibits + ( me.ibytes > 1 ? 'BE' : '' ) ];
            // current writing position in the result Buffer, when parsing random data
            me.wpos = 0;
            // bitmap used when parsing random data, now used only for permutations
            me.bitmap = null;
            // create result Buffer without filling it
            me.result = new Buffer( me.tbytes );
        }
        , sproto = null
        ;

    util.inherits( Sequence, emitter );

    sproto = Sequence.prototype;

    sproto.clear = function () {
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

    sproto.fill = function () {
        var me = this
            , ibytes = me.ibytes
            , range = me.range
            , tbytes = me.tbytes
            , result = me.result
            , wuint = me.wuint
            , o = tbytes - ibytes + 1
            , i = 0
            , pick = rand.bind( me, 0, range - 1 )
            ;
        // trivial filling with Math.random, it is not properly random..
        for ( ; i < o; i += ibytes ) result[ wuint ]( pick(), i );
        return me;
    };

    sproto.shuffle = function ( times ) {
        var me = this
            , t = max( abs( + times ) >>> 0, 1 )
            , b = me.ibytes
            , i = me.items
            , result = me.result
            , swap = Bice.swap
            , k = -1
            , ko = -1
            ;
        /*
         * Execute multiple times a (trivial) Fisher-Yates shuffle,
         *
         * NOTE: it uses Math.random, then using while cycle to discard
         * indexes out of range, is totally useless; Math.random already
         * (trivially) guarantees that indexes are within the current range.
         *
         */
        for ( ; t; --t )
            for ( k = i - 1, ko = k * b; k > 0; --k, ko -= b )
                swap( result, ko, rand( 0, k ) * b, b );
        return me;
    };

    sproto.in = function ( value ) {
        var me = this
            , r = me.range
            , v = abs( + value )
            ;
        return v < r ? 1 : -1;
    };

    sproto.parse = function ( data ) {
        var me = this
            , dlen = data.length
            , tbytes = me.tbytes
            , ibytes = me.ibytes
            , bits = me.bits
            , ibits = me.ibits
            , shift = ibits - bits
            , ruint = me.ruint
            , wuint = me.wuint
            // current data read offset and limit
            , l = dlen - ibytes
            , o = 0
            ;
        return me;
    };

    return Sequence;

} )();