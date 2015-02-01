/*
 * Transform Stream for Random Sequence, unlimited repetitions.
 */

module.exports = ( function () {

    var abs = Math.abs
        , ceil = Math.ceil
        , dlog = Math.log
        , max = Math.max
        , log2 = dlog( 2 )
        , util = require( 'util' )
        , stream = require( 'stream' )
        , Bolgia = require( 'bolgia' )
        , Bice = require( 'bice' )
        , compare = Bice.compare
        , clone = Bolgia.clone
        , improve = Bolgia.improve
        // stream default options
        , stream_opt = {
            highWaterMark : 16 * 1024
            , encoding : null
            , objectMode : false
        }
        , SeqTransStream = function ( i, r, opt ) {
            var me = this
                , is = me instanceof SeqTransStream
                ;
            if ( ! is ) return new SeqTransStream( i, r, opt );

            stream.Transform.call( me, improve( clone( opt ), stream_opt ) );

            /*
             * Get how many bits and bytes are necessary to
             * represent values in the specified range, min
             * is 1 byte.
             */
            var range = r >>> 0 ? abs( r ) : 1
                // 0 items means no limits.
                , items = abs( i ) >>> 0
                // , repeat = Infinity
                , bits = max( ceil( dlog( range ) / log2 ), 1 )
                , ibytes = max( ceil( bits / 8 ), 1 )
                , ibits = ibytes << 3 >>> 0
                // choose appropriate method for reading/writing ints/uints from 8 to 32 bits
                , ruint = [ 'readUInt' + ibits + ( ibytes > 1 ? 'BE' : '' ) ]
                , wuint = [ 'writeUInt' + ibits + ( ibytes > 1 ? 'BE' : '' ) ]
                // use a Buffer for range value, for faster comparisons when parsing data.
                , brange = new Buffer( ibytes )
                // currying compare function with current range
                , bcompare = compare.bind( me, brange, 0 )
                ;

            // write the range value to Buffer.
            brange[ wuint ]( range - 1, 0 );

            me._sequence = {
                range : range
                , items : items
                , left : items ? items : -1
                , bits : bits
                , ibytes : ibytes
                , ibits : ibits
                , ruint : ruint
                , wuint : wuint
                , cmask : 0xff >>> ( ibits - bits )
                , brange : brange
                , compare : bcompare
            };

        }
        , stsproto = null
        ;

    util.inherits( SeqTransStream, stream.Transform );

    stsproto = SeqTransStream.prototype;

    stsproto._transform = function ( data, encoding, done ) {
        var me = this
            , seq = me._sequence
            , bcomp = seq.compare
            , ibytes = seq.ibytes
            , cmask = seq.cmask
            , dlen = data.length
            , l = dlen - ibytes
            , o = 0
            , s = 0
            ;
        for ( ; o <= l; o += ibytes ) {
            data[ o ] &= cmask;
            if ( ~ bcomp( data, o ) ) {
                // value is in the selected range
                if ( ( ~ seq.left ) && ( --seq.left <= 0 ) ) {
                    // items limit was reached, push data
                    if ( s <= o ) me.push( data.slice( s, o + ibytes ) );
                    // end the stream
                    return me.push( null ) & done();
                }
                continue;
            }
            // value is out of range, slice all good values
            if ( s < o ) me.push( data.slice( s, o ) );
            s = o + ibytes;
        }
        // before calling done(), check for previous skipped values to push
        if ( s + ibytes < o ) me.push( data.slice( s, dlen ) );
        done();
    };

    stsproto._flush = function ( done ) {
        var me = this
            , seq = me._sequence
            ;
        // reset the counter for left items
        seq.left = seq.items ? seq.items : -1;
        done();
    };

    return SeqTransStream;

} )();