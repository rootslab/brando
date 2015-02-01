/*
 * EventEmiiter for Random Sequences, unlimited repetitions.
 */

module.exports = ( function () {

    if ( ! Buffer.readUInt24LE ) require( '../utils/buffer' );

    var abs = Math.abs
        , ceil = Math.ceil
        , dlog = Math.log
        , floor = Math.floor
        , max = Math.max
        , random = Math.random
        , log2 = dlog( 2 )
        , emitter = require( 'events' ).EventEmitter
        , util = require( 'util' )
        , Bice = require( 'bice' )
        // light check for Buffer#compare
        , notlegacy = typeof Buffer.compare === 'function'
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
        , Sequence = function ( i, r ) {
            var me = this
                ;
            /*
             * Get how many bits and bytes are necessary to represent
             * values in the specified range, minimum size is 1 byte.
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
            // items left
            me.left = me.items;
            // write the range value to a Buffer for faster comparisons when parsing data
            me.brange = new Buffer( me.ibytes );
            me.brange[ me.wuint ]( me.range - 1, 0 );
            /*
             * Currying compare function with the current range.
             * NOTE: slice buffer for now, until new Buffer.compare
             * accepts index arguments.
             */
            me.bcompare = notlegacy ? Buffer.compare.bind( me, me.brange ) : Bice.compare.bind( me, me.brange, 0 );
            // create result Buffer without filling it with data
            me.result = new Buffer( me.tbytes );
        }
        , sproto = null
        ;

    util.inherits( Sequence, emitter );

    sproto = Sequence.prototype;

    sproto.clear = function ( trash, zerofill ) {
        var me = this
            ;
        // create new Buffer
        me.result = trash ? new Buffer( me.tbytes ) : me.result;
        // clear result buffer and indexes
        if ( zerofill ) me.result.fill();
        me.wpos = 0;
        me.left = me.items;
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
         * Execute multiple times a (trivial) Fisher-Yates shuffle.
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

    /*
     * The probability of picking a correct random value in the selected range will
     * be always >= 1/2. Then, we expect to consume/parse, at most, 2 bytes for every
     * byte we need to fill result, or twice the size of the result Buffer.
     *
     * The Algo parses the input data from a random source, if there wasn't enough
     * data/information to fill the result buffer, it exits emitting the 'feed' event,
     * together with two numbers representing the remaining bytes to write to fill the
     * result buffer, and the ratio between the used data and the overall consumed/parsed
     * data.
     *
     * The Algorithm, before reading a byte/multibyte value, cuts left-most bits from the
     * first (left-most) byte, then, it copies the value to result only if it's in the
     * current selected range.
     *
     * When results are totally available, it emits 'fart' event, together with the
     * result Buffer and the ratio between used and consumed data.
     *
     * NOTE: when the selected range is within the next power of 2, the probability of
     * discarding a value parsed from the random source, decreases; then, the algorithm
     * approach is to copy an entire slice of good values, only when it encounters a
     * value not in the selected range; so it is faster than copying a value at a time.
     *
     * Example :
     *
     *  - 2^(4) or 32 is an example of an optimal choice for a range (values from 0 to 31),
     *    indeed, after cutting (3) bits from every 1-byte parsed value, we expect to accept
     *    the value with probability 1.
     *
     *  - 2^(4) + 1 or 33 is an example of bad value. Algorithm needs to parse 2 bytes
     *    of random data to read an entire value, but it doesn't accept all values in
     *    the range [32, 65535]; then, after cutting (7) bits from the first (left-most)
     *    byte, the range of current value will be restricted to [0, 63], then now, the
     *    probability of discarding it, will be always ~<=0.5.
     */
    sproto.parse = function ( data ) {
        var me = this
            , bcomp = me.bcompare
            , result = me.result
            , tbytes = me.tbytes
            , ibytes = me.ibytes
            , bits = me.bits
            , ibits = me.ibits
            , cmask = 0xff >>> ( ibits - bits )
            , dlen = data.length
            , l = dlen - ibytes
            , o = 0
            , s = 0
            , ratio = -1
            ;
        for ( ; me.left; o += ibytes ) {
            if ( o > l ) break;
            data[ o ] &= cmask;
            // if ( ~ Buffer.compare( me.brange, data.slice( o ) ) ) {
            if ( ~ bcomp( data, o ) ) {
                --me.left;
                if ( ( o - s ) === tbytes ) {
                    data.copy( result, me.wpos, s, o );
                    me.wpos = tbytes;
                    me.left = 0;
                    break;
                }
                if ( o < l ) continue;
                data.copy( result, me.wpos, s, dlen );
                me.wpos += dlen - s;
                break;
            }
            if ( s < o ) {
                data.copy( result, me.wpos, s, o );
                me.wpos += o - s;
            }
            s = o + ibytes;
        }
        ratio = tbytes < o ? tbytes / o : 1;
        return me.left ?
               me.emit( 'feed', tbytes - me.wpos, ratio ) :
               me.emit( 'fart', me.result, ratio )
               ;
    };

    return Sequence;

} )();