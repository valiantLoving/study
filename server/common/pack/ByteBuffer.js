"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const R = require("ramda");
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
class ByteBuffer {
    constructor(org_buf, offset) {
        this._org_buf = org_buf;
        this._encoding = "utf8";
        this._offset = offset || 0;
        this._list = [];
        this._endian = "B";
    }
    encoding(encode) {
        this._encoding = encode;
        return this;
    }
    endian(endian) {
        this._endian = endian;
        return this;
    }
    dealTypes(val, index, offset, ele, type, len) {
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
    }
    dealRead(type, offset) {
        const readMethods = {
            [ETypes.BYTE]: "readUInt8",
            [ETypes.SHORT]: `readInt16${this._endian}E`,
            [ETypes.USHORT]: `readUInt16${this._endian}E`,
            [ETypes.INT32]: `readInt32${this._endian}E`,
            [ETypes.UINT32]: `readUInt32${this._endian}E`
        };
        const method = readMethods[type];
        var val = this._org_buf[method](this._offset);
        this._offset += offset;
        return val;
    }
    byte(val, index) {
        return this.dealTypes(val, index, 1, this._org_buf.readUInt8(this._offset), ETypes.BYTE, 1);
    }
    readByte() {
        return this.dealRead(ETypes.BYTE, 1);
    }
    short(val, index) {
        return this.dealTypes(val, index, 2, this._org_buf[`readInt16${this._endian}E`](this._offset), ETypes.SHORT, 2);
    }
    readShort() {
        return this.dealRead(ETypes.SHORT, 2);
    }
    ushort(val, index) {
        return this.dealTypes(val, index, 2, this._org_buf[`readUInt16${this._endian}E`](this._offset), ETypes.USHORT, 2);
    }
    readUshort() {
        return this.dealRead(ETypes.USHORT, 2);
    }
    int32(val, index) {
        if (R.isNil(val)) {
            this._list.push(this._org_buf[`readInt32${this._endian}E`](this._offset));
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
    }
    readInt32() {
        return this.dealRead(ETypes.INT32, 4);
    }
    uint32(val, index) {
        if (R.isNil(val)) {
            this._list.push(this._org_buf[`readUInt32${this._endian}E`](this._offset));
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
    }
    readUInt32() {
        return this.dealRead(ETypes.UINT32, 4);
    }
    string(val, index) {
        if (R.isNil(val)) {
            const len = this._org_buf[`readUInt32${this._endian}E`](this._offset);
            this._offset += 4;
            this._list.push(this._org_buf.toString(this._encoding, this._offset, this._offset + len));
            this._offset += len;
        }
        else {
            const len = val ? Buffer.byteLength(val, this._encoding) : 0;
            this._list.splice(index != undefined ? index : this._list.length, 0, {
                t: ETypes.STRING,
                d: val,
                l: len
            });
            this._offset += len + 4;
        }
        return this;
    }
    readString() {
        const len = this._org_buf[`readUInt32${this._endian}E`](this._offset);
        this._offset += 4;
        var val = this._org_buf.toString(this._encoding, this._offset, this._offset + len);
        this._offset += len;
        return val;
    }
    byteArray(len, val, index) {
        if (!len) {
            throw new Error(`ByteBuffer byteArray mush receive len argument`);
        }
        if (R.isNil(val)) {
            const arr = [];
            for (let i = this._offset; i < this._offset + len; i++) {
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
    }
    unpack() {
        return this._list;
    }
    pack(isHead) {
        this._org_buf = Buffer.alloc(isHead ? this._offset + 4 : this._offset);
        let offset = 0;
        if (isHead) {
            this._org_buf[`writeUInt32${this._endian}E`](this._offset, offset);
            offset += 4;
            console.log(`=======pack head========, ${JSON.stringify(this)}`);
        }
        for (let i = 0; i < this._list.length; i++) {
            const ele = this._list[i];
            switch (ele.t) {
                case ETypes.BYTE:
                    this._org_buf.writeUInt8(ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.SHORT:
                    this._org_buf[`writeInt16${this._endian}E`](ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.USHORT:
                    this._org_buf[`writeUInt16${this._endian}E`](ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.INT32:
                    this._org_buf[`writeInt32${this._endian}E`](ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.UINT32:
                    this._org_buf[`writeUInt32${this._endian}E`](ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.STRING:
                    this._org_buf[`writeUInt32${this._endian}E`](ele.l, offset);
                    offset += 4;
                    this._org_buf.write(ele.d, offset, ele.l, this._encoding);
                    offset += ele.l;
                    break;
                case ETypes.VSTRING:
                    const vLen = Buffer.byteLength(ele.d, this._encoding);
                    this._org_buf.write(ele.d, offset, ele.l, this._encoding);
                    for (let j = offset + vLen; j < offset + ele.l; j++) {
                        this._org_buf.writeUInt8(0, j);
                    }
                    offset += ele.l;
                    break;
                case ETypes.INT64:
                    this._org_buf[`writeDouble${this._endian}E`](ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.FLOAT:
                    this._org_buf[`writeFloat${this._endian}E`](ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.DOUBLE:
                    this._org_buf[`writeDouble${this._endian}E`](ele.d, offset);
                    offset += ele.l;
                    break;
                case ETypes.BYTE_ARRAY:
                    let index = 0;
                    for (let i = offset; i < offset + ele.l; i++) {
                        if (index < ele.d.length) {
                            this._org_buf.writeUInt8(ele.d[index], i);
                        }
                        else {
                            this._org_buf.writeUInt8(0, i);
                        }
                        index++;
                    }
                    offset += ele.l;
                    break;
            }
            console.log(`=======pack ${i}========, ele ${JSON.stringify(ele)}, ${JSON.stringify(this)}`);
        }
        return this._org_buf;
    }
    getAvailable() {
        if (!this._org_buf) {
            return this._offset;
        }
        return this._org_buf.length - this._offset;
    }
}
exports.ByteBuffer = ByteBuffer;
