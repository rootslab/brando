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
        get : function ( items, range, repetition ) {
            var me = this
                // normalize values to 32 bits
                , i = abs( + items ) >>> 0 || 1
                , r = abs( + range ) >>> 0 || 1
                , seq = repetition !== false
                ;
            // restrict max items to 2^(16) - 1
            i = i & 0xffff;
            // with no repetition, items should be always <= range
            return seq ? new random.sequence( i, r ) :
                   ( i < r ? new random.partperm( i, r ) :
                   ( i > r ? null : new random.fullperm( i ) ) )
                   ;
        }

    };

} )();