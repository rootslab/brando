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
        , compare = Bice.compare
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
        // masks for cut bits out of current range 
        , masks = new Buffer( [ 0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07, 0x03, 0x01 ] )
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
            me.ruint = [ 'readUInt' + me.ibits + ( me.ibytes > 1 ? 'BE' : '' ) ];
            me.wuint = [ 'writeUInt' + me.ibits + ( me.ibytes > 1 ? 'BE' : '' ) ];
            // current writing position in the result Buffer, when parsing random data
            me.wpos = 0;
            // write the range value to a Buffer for faster comparisons when parsing data
            me.brange = new Buffer( me.ibytes );
            me.brange[ me.wuint ]( me.range - 1, 0 );
            // currying compare function with current range
            me.bcompare = compare.bind( me, me.brange, 0 );
            // create result Buffer without filling it with data
            me.result = new Buffer( me.tbytes );
        }
        , sproto = null
        ;

    util.inherits( Sequence, emitter );

    sproto = Sequence.prototype;

    sproto.clear = function ( zerofill ) {
        var me = this
            ;
        // clear result buffer and indexes
        if ( zerofill ) me.result.fill();
        me.wpos = 0;
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

    sproto.parse = function ( data ) {
        var me = this
            , bcomp = me.bcompare
            , brange = me.brange
            , result = me.result
            , tbytes = me.tbytes
            , ibytes = me.ibytes
            , bits = me.bits
            , ibits = me.ibits
            , cmask = masks[ ibits - bits ]
            , dlen = data.length
            , l = dlen - ibytes
            , o = 0
            , s = 0
            ;
        /*
         * Parse the input data from a random source, if there wasn't enough information
         * to fill the result buffer, it exits emitting emits 'feed' event, together with
         * a number that represents the remaining bytes to write.
         * Firstly, before reading a byte or a multibyte value, cut left-most bits from
         * the first (left-most) byte, then copy the value to result, but only if it's in
         * the current range.
         * When results are available, it emits 'fart' event, with the result Buffer.
         */
        for ( ; me.wpos < tbytes; o += ibytes ) {
            if ( o > l ) return me.emit( 'feed', tbytes - me.wpos - 1 );
            data[ o ] &= cmask;
            if ( ~ bcomp( data, o ) ) {
                if ( ( o === l ) && ( s < o ) ) {
                    data.copy( result, me.wpos, s, dlen );
                    me.wpos += dlen - s;
                    break;
                }
                continue;
            }
            if ( s < o ) {
                data.copy( result, me.wpos, s, o );
                me.wpos += o - s;
            }
            s = o + ibytes;
        }
        return me.wpos === tbytes ?
               me.emit( 'fart', me.result ) :
               me.emit( 'feed', tbytes - me.wpos - 1 )
               ;
    };

    return Sequence;

} )();