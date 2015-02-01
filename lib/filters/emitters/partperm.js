/*
 * EventEmiiter for Partial Range Permutations, no repetitions.
 */

module.exports = ( function () {

    if ( ! Buffer.readUInt24LE ) require( '../utils/buffer' );

    var floor = Math.floor
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

    pproto.clear = function ( trash, zerofill ) {
        var me = this
            , parent = me.constructor.super_
            , range = me.range
            , bmap = me.bitmap
            ;
        // clear result buffer and bitmap
        parent.prototype.clear.call( me, trash, zerofill );
        if ( bmap instanceof Toni ) bmap.clear();
        else me.bitmap = Toni( { range : range } );
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
     * values that covers more than ~7/8 of the full range, to avoid waste of memory,
     * in those cases it is better to use FP.
     *
     * How many bytes of random data will be consumed, depends on the range selected.
     *
     * Generally the minimum consumption of data happens when we have range equal to a power of 2,
     * or if range = 2^p, algo checks for values with p bits.
     *
     * - the probability to find the 1st value is 1 or range/range, for 2nd is (range - 1)/range
     * - the probability to find the k-th value is (range - k + 1)/range or 1 - (k - 1)/range
     * - the probability to find the k-th value if items ~= range is 1 - (range-1)/range or ~0
     * 
     * Then, to have a chance of at least 50% to find a value, in the worst case, we can set:
     * 
     * - (k-1)/range = 1/2 or k = 1 + range/2
     *
     * So, when the items > 1 + range/2, we expect to consume more than 2 random values to find
     * an element to insert.
     * 
     * The worst case is when the range is equal to a power of 2 + 1, when range = 2^(p) + 1,
     * algo checks for values with p+1 bits, but those values are in the range 0 to 2^(p + 1),
     * so, on the average, the probability to find a value in the correct range is:
     *
     * (2^(p) + 1) / 2^(p + 1), or 1/2 + 2^-(p+1) ~ 1/2
     *
     * Then, using result from the previous case, the probability to find the k-th value, is
     * (1/2) - (1/2)*(k - 1)/range. When we set items ~ range/2, the probability to find the
     * last value is, on the average, =~ 1/4 + 1/(2*r) or ~ 25%.
     *
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
            , cmask = 0xff >>> ( ibits - bits )
            , dlen = data.length
            , l = dlen - ibytes
            , o = 0
            , ratio = -1
            , r = -1
            ;
        for ( ; me.left; o += ibytes ) {
            if ( o > l ) break;
            data[ o ] &= cmask;
            if ( ( ( r = data[ ruint ]( o ) ) < range ) && ~ bmap.add( r ) ) {
                --me.left;
                result[ wuint ]( r, me.wpos );
                me.wpos += ibytes;
            }
        }
        ratio = tbytes < o ? tbytes / o : 1;
        return me.left ?
               me.emit( 'feed', tbytes - me.wpos, ratio ) :
               me.emit( 'fart', me.result, ratio )
               ;
    };

    return PartPerm;

} )();