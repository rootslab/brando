/*
 * Partial Permutation, no repetitions.
 */

module.exports = ( function () {

    if ( ! Buffer.readUInt24LE ) require( '../utils/buffer' );

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

    /*
     * Partial permutations (PP) implementation uses also a bitmap, it increases of
     * about 1/8 the memory consumption; then PP should never be used with a set of
     * values that covers no more than ~7/8 of the full range, to avoid waste of memory,
     * in this case it is better to use FP.
     *
     * How many bytes of random data will be consumed, depends on the ratio between items
     * and the range selected.
     *
     * Generally the minimum consumption of data happens when we have range equal to a pow
     * of 2, instead, the worst case is when the range is equal to a (pow of 2) + 1.
     *
     * When range = (a pow of 2):
     * - the probability to find the 1st value is 1/items
     * - the probability to find the k-th value is 1/(items - k)
     *
     * It means that, for a particular value k not already inserted/parsed, on the average,
     * we expect (items - k) bytes for finding it. Then 1 byte for the first, 2 for the 2nd
     * and so on.
     * This bring us to the well known Gauss formula to sum n integers, on the worst case, to
     * obtain all distinct values, we expect to consume:
     *
     * - (items/2)*(items+1) bytes, or ( items^(2) + items )/2
     *
     * Formula suggests to use items = radix(range) to have a 50% consumption of random data,
     * in the worst case or probability to find a value of ~1/2:
     *
     * - ((radix(range))^(2) + radix(range))/2 = (range + radix(range))/2, or ~radix/2
     *
     * When range = (a pow of 2) + 1:
     * - the algo cuts 7 bits from the left-most byte of parse value (see comments in sequence.js),
     *   then the probability that the current value is in range is >~1/2. Then all probability 
     *   results above, will be divided by 2 in the worst case.
     *
     * These results show that PPs have a limited use, instead we can use FPs in most cases.
     */
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
            if ( o > l ) break;
            data[ o ] &= cmask;
            if ( ( ( r = data[ ruint ]( o ) ) < range ) && ~ bmap.add( r ) ) {
                result[ wuint ]( r, me.wpos );
                me.wpos += ibytes;
            }
        }
        return me.wpos < tbytes ?
               me.emit( 'feed', tbytes - me.wpos, tbytes / o ):
               me.emit( 'fart', me.result, tbytes / o )
               ;
    };

    return PartPerm;

} )();