/*
* Transform Stream for Random Sequence, unlimited repetitions.
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
        , util = require( 'util' )
        , stream = require( 'stream' )
        , Bolgia = require( 'bolgia' )
        , Bice = require( 'bice' )
        , compare = Bice.compare
        , swap = Bice.swap
        , clone = Bolgia.clone
        , improve = Bolgia.improve
        // masks for cut bits out of current range
        , masks = new Buffer( [ 0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07, 0x03, 0x01 ] )
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

            me.constructor.super_.call( me, improve( clone( opt ), stream_opt ) );

            /*
             * Get how many bits and bytes are necessary to
             * represent values in the specified range, min
             * is 1 byte.
             */
            var range = r >>> 0 ? abs( r ) : 1
                , items = i >>> 0 ? abs( i ) : 1
                // , repeat = Infinity
                , bits = max( ceil( dlog( range ) / log2 ), 1 )
                , ibytes = max( ceil( bits / 8 ), 1 )
                , ibits = ibytes << 3 >>> 0
                , tbytes = ibytes * items
                // choose appropriate method for reading/writing ints/uints from 8 to 32 bits
                , ruint = [ 'readUInt' + ibits + ( ibytes > 1 ? 'BE' : '' ) ]
                , wuint = [ 'writeUInt' + ibits + ( ibytes > 1 ? 'BE' : '' ) ]
                // current writing position in the result Buffer, when parsing random data
                , wpos = 0
                // use a Buffer for range value, for faster comparisons when parsing data.
                , brange = new Buffer( ibytes )
                // currying compare function with current range
                , bcompare = compare.bind( me, brange, 0 )
                , bsize = 8 * 1024
                ;

            // write the range value to Buffer.
            brange[ wuint ]( range - 1, 0 );

            me._sequence = {
                range : range
                , items : items
                , bits : bits
                , ibytes : ibytes
                , ibits : ibits
                , tbytes : tbytes
                , runit : ruint
                , wuint : wuint
                , bcompare : bcompare
                , brange : brange
                , buffer : new Buffer( bsize )
                , bsize : bsize
                , bpos : 0
            };

        }
        , stsproto = null
        ;

    util.inherits( SeqTransStream, stream.Transform );

    stsproto = SeqTransStream.prototype;

    stsproto._transform = function ( data, encoding, done ) {
        var me = this
            , seq = me._sequence
            , bcomp = seq.bcompare
            , brange = seq.brange
            , result = seq.result
            , ibytes = seq.ibytes
            , tbytes = seq.tbytes
            , bits = seq.bits
            , ibits = seq.ibits
            , cmask = masks[ ibits - bits ]
            , dlen = data.length
            , l = dlen - ibytes
            , o = 0
            ;
        /*
         * Bufferize the incoming data.
         *
         * NOTE: without buffering, push could be:
         *      if ( ~ bcomp( data, o ) )
         *          me.push( data.slice( o, o + ibytes ) );
         */
        for ( ; o <= l; o += ibytes ) {
            data[ o ] &= cmask;
            if ( ~ bcomp( data, o ) ) {
                if ( seq.bpos + ibytes >= seq.bsize ) {
                    // current buffer is not big enough, create a new one,
                    me.push( seq.buffer.slice( 0, seq.bpos ) );
                    seq.bpos = 0;
                    seq.buffer = new Buffer( seq.bsize );
                }
                // TODO: it's better to copy a slice, not a value at a time.
                data.copy( seq.buffer, seq.bpos, o, o + ibytes );
                seq.bpos += ibytes;
                // limit result to items.
                if ( seq.bpos === tbytes )
                    me.push( seq.buffer.slice( 0, tbytes ) );
            }
        }
        done();
    };

    stsproto._flush = function ( done ) {
        var me = this
            , seq = me._sequence
            , bpos = seq.bpos
            , ibytes = seq.ibytes
            , buff = seq.buffer
            ;
        seq.bpos = 0;
        done();
    };

    return SeqTransStream;

} )();