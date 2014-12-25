/*
 * Exports all transform streams.
 */

module.exports = ( function () {
    return {
        fullperm : require( './fullperm-transform' )
        , partperm : require( './partperm-transform' )
        , sequence : require( './sequence-transform' )
    };
} )();