/*
 * Full Range Permutation, no repetitions.
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
        , FullPerm = function ( i ) {
            var me = this
                ;
            /*
             * Get how many bits and bytes are necessary to
             * represent values in the specified range, min
             * is 1 byte.
             */
            me.range = r >>> 0 ? abs( r ) : 1;
            me.items = me.range;
            me.ibits = max( ceil( dlog( me.range ) / log2 ), 1 );
            me.ibytes = max( ceil( me.ibits / 8 ), 1 );
            me.tbytes = me.ibytes * me.items;

            // TODO - check range and items limits
            me.result = new Buffer( me.tbytes );
        }
        , fproto = null
        ;

    util.inherits( FullPerm, emitter );

    fproto = FullPerm.prototype;

    fproto.fill = function () {
        var me = this
            ;
        return me;
    };

    fproto.shuffle = function () {
        var me = this
            ;
        return me;
    };

    fproto.parse = function () {
        var me = this
            ;
        return me;
    };

    return FullPerm;

} )();