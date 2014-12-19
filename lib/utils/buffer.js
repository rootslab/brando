module.exports = ( function () {

    if ( Buffer.prototype.readUInt24LE ) return;

    // See also my PR#169 https://github.com/iojs/io.js/pull/169

    function checkOffset(offset, ext, length) {
      if (offset + ext > length)
        throw new RangeError('index out of range');
    }

    Buffer.prototype.readUInt24LE = function(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 3, this.length);

        return ((this[offset]) |
            (this[offset + 1] << 8) |
            (this[offset + 2] << 16));
    };

    Buffer.prototype.readUInt24BE = function(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 3, this.length);

        return ((this[offset] << 16) |
            (this[offset + 1] << 8) |
            this[offset + 2]);
    };

    Buffer.prototype.readInt24LE = function(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 3, this.length);

        return (this[offset]) |
            (this[offset + 1] << 8) |
            (this[offset + 2] << 16);
    };

    Buffer.prototype.readInt24BE = function(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 3, this.length);

        return (this[offset] << 16) |
            (this[offset + 1] << 8) |
            (this[offset + 2]);
    };

    Buffer.prototype.writeUInt24LE = function(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
          checkInt(this, value, offset, 3, 0xffffff, 0);
        this[offset + 2] = (value >>> 16);
        this[offset + 1] = (value >>> 8);
        this[offset] = value;
        return offset + 3;
    };

    Buffer.prototype.writeUInt24BE = function(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
          checkInt(this, value, offset, 3, 0xffffff, 0);
        this[offset] = (value >>> 16);
        this[offset + 1] = (value >>> 8);
        this[offset + 2] = value;
        return offset + 3;
    };

    Buffer.prototype.writeInt24LE = function(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
          checkInt(this, value, offset, 3, 0x7fffff, -0x800000);
        this[offset] = value;
        this[offset + 1] = (value >>> 8);
        this[offset + 2] = (value >>> 16);
        return offset + 3;
    };

    Buffer.prototype.writeInt24BE = function(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
          checkInt(this, value, offset, 3, 0x7fffff, -0x800000);
        this[offset] = (value >>> 16);
        this[offset + 1] = (value >>> 8);
        this[offset + 2] = value;
        return offset + 3;
    };

} )();