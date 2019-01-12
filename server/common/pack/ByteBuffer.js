"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var R = require("ramda");
var ETypes;
(function (ETypes) {
    ETypes[ETypes["BYTE"] = 1] = "BYTE";
    ETypes[ETypes["SHORT"] = 2] = "SHORT";
    ETypes[ETypes["USHORT"] = 3] = "USHORT";
    ETypes[ETypes["INT32"] = 4] = "INT32";
    ETypes[ETypes["UINT32"] = 5] = "UINT32";
    ETypes[ETypes["STRING"] = 6] = "STRING";
    ETypes[ETypes["VSTRING"] = 7] = "VSTRING";
    ETypes[ETypes["INT64"] = 8] = "INT64";
    ETypes[ETypes["FLOAT"] = 9] = "FLOAT";
    ETypes[ETypes["DOUBLE"] = 10] = "DOUBLE";
    ETypes[ETypes["BYTE_ARRAY"] = 11] = "BYTE_ARRAY";
})(ETypes || (ETypes = {}));
var ByteBuffer = (function () {
    function ByteBuffer(org_buf, offset) {
        this._org_buf = org_buf;
        this._encoding = "utf8";
        this._offset = offset || 0;
        this._list = [];
        this._endian = "B";
    }
    ByteBuffer.prototype.encoding = function (encode) {
        this._encoding = encode;
        return this;
    };
    ByteBuffer.prototype.endian = function (endian) {
        this._endian = endian;
        return this;
    };
    ByteBuffer.prototype.dealTypes = function (val, index, offset, ele, type, len) {
        if (val == undefined || val == null) {
            this._list.push(ele);
        }
        else {
            this._list.splice(index != undefined ? index : this._list.length, 0, {
                t: type,
                d: val,
                l: len
            });
        }
        this._offset += offset;
        return this;
    };
    ByteBuffer.prototype.dealRead = function (type, offset) {
        var _a;
        var readMethods = (_a = {},
            _a[ETypes.BYTE] = "readUInt8",
            _a[ETypes.SHORT] = "readInt16" + this._endian + "E",
            _a[ETypes.USHORT] = "readUInt16" + this._endian + "E",
            _a[ETypes.INT32] = "readInt32" + this._endian + "E",
            _a[ETypes.UINT32] = "readUInt32" + this._endian + "E",
            _a);
        var method = readMethods[type];
        var val = this._org_buf[method](this._offset);
        this._offset += offset;
        return val;
    };
    ByteBuffer.prototype.byte = function (val, index) {
        return this.dealTypes(val, index, 1, this._org_buf.readUInt8(this._offset), ETypes.BYTE, 1);
    };
    ByteBuffer.prototype.readByte = function () {
        return this.dealRead(ETypes.BYTE, 1);
    };
    ByteBuffer.prototype.short = function (val, index) {
        return this.dealTypes(val, index, 2, this._org_buf["readInt16" + this._endian + "E"](this._offset), ETypes.SHORT, 2);
    };
    ByteBuffer.prototype.readShort = function () {
        return this.dealRead(ETypes.SHORT, 2);
    };
    ByteBuffer.prototype.ushort = function (val, index) {
        return this.dealTypes(val, index, 2, this._org_buf["readUInt16" + this._endian + "E"](this._offset), ETypes.USHORT, 2);
    };
    ByteBuffer.prototype.readUshort = function () {
        return this.dealRead(ETypes.USHORT, 2);
    };
    ByteBuffer.prototype.int32 = function (val, index) {
        if (R.isNil(val)) {
            this._list.push(this._org_buf["readInt32" + this._endian + "E"](this._offset));
        }
        else {
            this._list.splice(index != undefined ? index : this._list.length, 0, {
                t: ETypes.INT32,
                d: val,
                l: 4
            });
        }
        this._offset += 4;
        return this;
    };
    ByteBuffer.prototype.readInt32 = function () {
        return this.dealRead(ETypes.INT32, 4);
    };
    ByteBuffer.prototype.uint32 = function (val, index) {
        if (R.isNil(val)) {
            this._list.push(this._org_buf["readUInt32" + this._endian + "E"](this._offset));
        }
        else {
            this._list.splice(index != undefined ? index : this._list.length, 0, {
                t: ETypes.INT32,
                d: val,
                l: 4
            });
        }
        this._offset += 4;
        return this;
    };
    ByteBuffer.prototype.readUInt32 = function () {
        return this.dealRead(ETypes.UINT32, 4);
    };
    ByteBuffer.prototype.string = function (val, index) {
        if (R.isNil(val)) {
            var len = this._org_buf["readUInt32" + this._endian + "E"](this._offset);
            this._offset += 4;
            this._list.push(this._org_buf.toString(this._encoding, this._offset, this._offset + len));
            this._offset += len;
        }
        else {
            var len = val ? Buffer.byteLength(val, this._encoding) : 0;
            this._list.splice(index != undefined ? index : this._list.length, 0, {
                t: ETypes.STRING,
                d: val,
                l: len
            });
            this._offset += len + 4;
        }
        return this;
    };
    ByteBuffer.prototype.readString = function () {
        var len = this._org_buf["readUInt32" + this._endian + "E"](this._offset);
        this._offset += 4;
        var val = this._org_buf.toString(this._encoding, this._offset, this._offset + len);
        this._offset += len;
        return val;
    };
    ByteBuffer.prototype.byteArray = function (len, val, index) {
        if (!len) {
            throw new Error("ByteBuffer byteArray mush receive len argument");
        }
        if (R.isNil(val)) {
            var arr = [];
            for (var i = this._offset; i < this._offset + len; i++) {
                if (i < this._org_buf.length) {
                    arr.push(this._org_buf.readUInt8(i));
                }
                else {
                    arr.push(0);
                }
            }
            this._list.push(arr);
            this._offset += len;
        }
        else {
            this._list.splice(!R.isNil(index) ? index : this._list.length, 0, { t: ETypes.BYTE_ARRAY, d: val, l: len });
            this._offset += len;
        }
        return this;
    };
    ByteBuffer.prototype.unpack = function () {
        return this._list;
    };
    ByteBuffer.prototype.pack = function (isHead) {
        this._org_buf = Buffer.alloc(isHead ? this._offset + 4 : this._offset);
        var offset = 0;
        if (isHead) {
            this._org_buf["writeUInt32" + this._endian + "E"](this._offset, offset);
            offset += 4;
            console.log("=======pack head========, " + JSON.stringify(this));
        }
        for (var i = 0; i < this._list.length; i++) {
            var ele = this._list[i];
            switch (ele.t) {
                case ETypes.BYTE:
                    this._org_buf.writeUInt8(ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.SHORT:
                    this._org_buf["writeInt16" + this._endian + "E"](ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.USHORT:
                    this._org_buf["writeUInt16" + this._endian + "E"](ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.INT32:
                    this._org_buf["writeInt32" + this._endian + "E"](ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.UINT32:
                    this._org_buf["writeUInt32" + this._endian + "E"](ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.STRING:
                    this._org_buf["writeUInt32" + this._endian + "E"](ele.l, offset);
                    offset += 4;
                    this._org_buf.write(ele.d, offset, ele.l, this._encoding);
                    offset += ele.l;
                    break;
                case ETypes.VSTRING:
                    var vLen = Buffer.byteLength(ele.d, this._encoding);
                    this._org_buf.write(ele.d, offset, ele.l, this._encoding);
                    for (var j = offset + vLen; j < offset + ele.l; j++) {
                        this._org_buf.writeUInt8(0, j);
                    }
                    offset += ele.l;
                    break;
                case ETypes.INT64:
                    this._org_buf["writeDouble" + this._endian + "E"](ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.FLOAT:
                    this._org_buf["writeFloat" + this._endian + "E"](ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.DOUBLE:
                    this._org_buf["writeDouble" + this._endian + "E"](ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.BYTE_ARRAY:
                    var index = 0;
                    for (var i_1 = offset; i_1 < offset + ele.l; i_1++) {
                        if (index < ele.d.length) {
                            this._org_buf.writeUInt8(ele.d[index], i_1);
                        }
                        else {
                            this._org_buf.writeUInt8(0, i_1);
                        }
                        index++;
                    }
                    offset += ele.l;
                    break;
            }
            console.log("=======pack " + i + "========, ele " + JSON.stringify(ele) + ", " + JSON.stringify(this));
        }
        return this._org_buf;
    };
    ByteBuffer.prototype.getAvailable = function () {
        if (!this._org_buf) {
            return this._offset;
        }
        return this._org_buf.length - this._offset;
    };
    return ByteBuffer;
}());
exports.ByteBuffer = ByteBuffer;
