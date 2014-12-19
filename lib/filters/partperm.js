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
        , random = Math.random
        , log2 = dlog( 2 )
        , Sequence = require( './sequence' )
        , util = require( 'util' )
        , Bice = require( 'bice' )
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
                ;
            me.constructor.super_.call( me, i, r );
            // TODO - check range and items limits
        }
        , pproto = null
        ;

    util.inherits( PartPerm, Sequence );

    pproto = PartPerm.prototype;

    pproto.fill = function () {
        var me = this
            ;
        return me;
    };

    pproto.parse = function () {
        var me = this
            ;
        return me;
    };

    return PartPerm;

} )();