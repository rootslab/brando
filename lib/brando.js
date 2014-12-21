/*
 * Brando.
 *
 * Copyright(c) 2014 Guglielmo Ferri <44gatti@gmail.com>
 * MIT Licensed
 */

exports.version = require( '../package' ).version;
exports.Brando = ( function () {
    var log = console.log
        , abs = Math.abs
        , min = Math.min
        , random = require( './filters/' )
        // add missing methods to Buffer for r/w 24bits uints
        , utils = require( './utils/buffer' )
        ;

    return {
        get : function ( items, range, repeat ) {
            var me = this
                // normalize values to 32 bits
                , i = abs( + items ) >>> 0 || 1
                , r = abs( + range ) >>> 0 || 1
                , seq = repeat !== 1
                ;
            /*
             * NOTE: items are restricted to max 2^(16) - 1.
             *
             * Actually, there is no limit for sequence with repetitions, instead,
             * the max possible size for full and partial permutations (FP, PP) is
             * 2^(32) * 2^(2) bytes, or 16GB.
             *
             * Partial permutations (PP) implementation uses bitmap, it increases
             * of about 1/8 the memory consumption; then PP should be used with a
             * set of values that covers less than ~7/8 of the full range, to avoid
             * waste of memory; generally, it is better to use PP, as long as the
             * choosen set of values covers no more than 2/3 of the full range; it
             * ensures that the algorithm, used for parsing and selecting values from
             * the real random source, could find a usable value, with a probability
             * of at least 1/3 (33%); otherwise use FP, slicing the resulting set to
             * the desired size, to get a PP.
             */
            i = i & 0xffff;
            // with no repetition, items should be always <= range
            return seq ? new random.sequence( i, r ) :
                   ( i < r ? new random.partperm( i, r ) :
                   ( i > r ? null : new random.fullperm( i ) ) )
                   ;
        }

    };

} )();