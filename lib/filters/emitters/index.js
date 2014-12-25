/*
 * Exports all filters.
 */

module.exports = ( function () {
    return {
        fullperm : require( './fullperm' )
        , partperm : require( './partperm' )
        , sequence : require( './sequence' )
    };
} )();