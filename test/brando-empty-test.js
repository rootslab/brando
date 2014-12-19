/*
 * Brando empty test.
 */

exports.test  = function ( done, assertions ) {
    var log = console.log
        , exit = typeof done === 'function' ? done : function () {}
        , assert = assertions || require( 'assert' )
        , Brando = require( '../' )
        ;

    exit();
};

// single test execution with node
if ( process.argv[ 1 ] === __filename  ) exports.test = exports.test();