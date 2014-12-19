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
        , Bolgia = require( 'bolgia' )
        , filters = require( './filters/' )
        // add missing methods to Buffer for r/w 24b ints/uints
        , utils = require( './utils/buffer' )
        , clone = Bolgia.clone
        , improve = Bolgia.improve
        // brando default opt
        , brando_opt = {
            range : 1
            , items : 1
            , repetition : 1
        }
        ;

    return {
        get : function ( opt ) {
            var me = this
                , cfg = improve( clone( opt ), brando_opt )
                // normalize values to 32 bits
                , r = abs( + cfg.range ) >>> 0 || 1
                , i = abs( + cfg.items ) >>> 0 || 1
                ;

            if ( !! cfg.repetition ) {
                // random permutation (no repetition), items should be always <= range
                i = min( i, r );
                if ( r === i ) {
                    // full permutation
                    // check limits for full permutation
                    return new filters.fullperm( { range : r, items : i } );
                }
                // partial permutation
                // check limits for partial permutation
                return new filters.partperm( { range : r, items : i } );
            }
            // random sequence
            // check limits for sequences
            return new filters.sequence( { range : r, items : i } );
        }

    };

} )();