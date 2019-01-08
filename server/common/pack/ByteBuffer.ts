
import R = require("ramda");

enum ETypes {
    BYTE = 1,
    SHORT = 2,
    USHORT = 3,
    INT32 = 4,
    UINT32 = 5,
    STRING = 6,
    VSTRING = 7,
    INT64 = 8,
    FLOAT = 9,
    DOUBLE = 10,
    BYTE_ARRAY = 11
}

export class ByteBuffer {
    /**需要解包的二进制 */
    _org_buf: Buffer;
    /**编码方式 */
    _encoding: string;
    /**数据在二进制的初始位置 */
    _offset: number;

    _list: any[];
    _endian: string;

    constructor(org_buf?: Buffer, offset?: number) {
        this._org_buf = org_buf;
        this._encoding = "utf8";
        this._offset = offset || 0;
        this._list = [];
        this._endian = "B";
    }

    /**
     * 指定文字编码
     * @param encode
     */
    encoding(encode: string) {
        this._encoding = encode;
        return this;
    }

    /**
     * 指定字节序
     * @param endian
     */
    endian(endian: string) {
        this._endian = endian;
        return this;
    }

    dealTypes(
        val: number | string,
        index: number,
        offset: number,
        ele: number,
        type: ETypes,
        len: number
    ) {
        if (val == undefined || val == null) {
            this._list.push(ele);
        } else {
            this._list.splice(index != undefined ? index : this._list.length, 0, {
                t: type,
                d: val,
                l: len
            });
        }
        this._offset += offset;
        return this;
    }

    dealRead(type: ETypes, offset: number): number {
        const readMethods = {
            [ETypes.BYTE]: "readUInt8",
            [ETypes.SHORT]: `readInt16${this._endian}E`,
            [ETypes.USHORT]: `readUInt16${this._endian}E`,
            [ETypes.INT32]: `readInt32${this._endian}E`,
            [ETypes.UINT32]: `readUInt32${this._endian}E`
            //   [ETypes.STRING]: `readUInt32${this._endian}E`,
        };
        const method: string = readMethods[type];
        var val: number = this._org_buf[method](this._offset);
        this._offset += offset;
        return val;
    }

    byte(val: number, index: number) {
        return this.dealTypes(
            val,
            index,
            1,
            this._org_buf.readUInt8(this._offset),
            ETypes.BYTE,
            1
        );
    }

    /**
     * 读取一个字节,并返回该字节的值
     */
    readByte() {
        return this.dealRead(ETypes.BYTE, 1);
    }

    short(val: number, index: number) {
        return this.dealTypes(
            val,
            index,
            2,
            this._org_buf[`readInt16${this._endian}E`](this._offset),
            ETypes.SHORT,
            2
        );
    }

    readShort() {
        return this.dealRead(ETypes.SHORT, 2);
    }

    ushort(val: number, index: number) {
        return this.dealTypes(
            val,
            index,
            2,
            this._org_buf[`readUInt16${this._endian}E`](this._offset),
            ETypes.USHORT,
            2
        );
    }

    readUshort() {
        return this.dealRead(ETypes.USHORT, 2);
    }

    int32(val: number, index: number) {
        if (R.isNil(val)) {
            this._list.push(this._org_buf[`readInt32${this._endian}E`](this._offset));
        } else {
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

    uint32(val?: number | string, index?: number) {
        if (R.isNil(val)) {
            this._list.push(this._org_buf[`readUInt32${this._endian}E`](this._offset));
        } else {
            this._list.splice(index != undefined ? index : this._list.length, 0, {
                t: ETypes.INT32,
                d: val,
                l: 4
            });
        }
        this._offset += 4;
        // console.log(`========uint32======${JSON.stringify(this)}`);
        return this;
    }

    readUInt32() {
        return this.dealRead(ETypes.UINT32, 4);
    }

    /**
     * 变长字符串 前四个字节表示字符串长度
     */
    string(val?: string, index?: number) {
        if (R.isNil(val)) {
            // 读取字符串
            const len = this._org_buf[`readUInt32${this._endian}E`](this._offset);
            this._offset += 4;
            this._list.push(
                this._org_buf.toString(this._encoding, this._offset, this._offset + len)
            );
            this._offset += len;
        } else {
            // 写入字符串
            const len = val ? Buffer.byteLength(val, this._encoding) : 0;
            // console.log(`val:${val}, len:${len}`);
            this._list.splice(index != undefined ? index : this._list.length, 0, {
                t: ETypes.STRING,
                d: val,
                l: len
            });
            this._offset += len + 4;
        }
        // console.log(`========string======${JSON.stringify(this)}`);
        return this;
    }

    readString() {
        const len = this._org_buf[`readUInt32${this._endian}E`](this._offset);
        this._offset += 4;
        var val = this._org_buf.toString(
            this._encoding,
            this._offset,
            this._offset + len
        );
        this._offset += len;
        return val;
    }

    /**
     * 写入或者读取一段字节数组
     * @param len 
     * @param val 
     * @param index 
     */
    byteArray(len: number, val?: string | Buffer, index?: number) {
        if (!len) {
            throw new Error(`ByteBuffer byteArray mush receive len argument`);
        }
        if (R.isNil(val)) {
            const arr = [];
            for (let i = this._offset; i < this._offset + len; i++) {
                if (i < this._org_buf.length) {
                    // 从 buf 中指定的 offset 读取一个无符号的 8 位整数值
                    arr.push(this._org_buf.readUInt8(i));
                } else {
                    arr.push(0);
                }
            }
            this._list.push(arr);
            this._offset += len;
        } else {
            this._list.splice(!R.isNil(index) ? index : this._list.length, 0, { t: ETypes.BYTE_ARRAY, d: val, l: len });
            this._offset += len;
        }
        return this;
    }

    /**
     * 解包成数据数组
     */
    unpack() {
        return this._list;
    }

    /**
     * 打包成二进制
     * @params isHead 是否在前面加四个字节表示包长
     */
    pack(isHead?: boolean) {
        this._org_buf = Buffer.alloc(isHead ? this._offset + 4 : this._offset);
        let offset: number = 0;
        if (isHead) {
            //buf.writeUInt32BE(value, offset) 用指定的字节序格式将value写入到buf中指定的offset位置,value必须是无符号的32整数
            this._org_buf[`writeUInt32${this._endian}E`](this._offset, offset);
            offset += 4;
            console.log(`=======pack head========, ${JSON.stringify(this)}`);
        }

        for (let i = 0; i < this._list.length; i++) {
            const ele: {t: ETypes, d: string | Buffer | number, l: number} = this._list[i];
            switch (ele.t) {
                case ETypes.BYTE:
                    this._org_buf.writeUInt8(<number>ele.d, offset);
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
                    // 前四个字节表示字符串长度
                    this._org_buf[`writeUInt32${this._endian}E`](ele.l, offset);
                    offset += 4;
                    // buf.write(string[, offset[, length]][, encoding])
                    // 根据encoding指定的字符编码将string写入到buf中的offset位置,如果buf没有足够的空间保存整个字符串,则只会写入string的一部分
                    this._org_buf.write(<string>ele.d, offset, ele.l, this._encoding);
                    offset += ele.l;
                    break;
                case ETypes.VSTRING:
                    // 字符串实际长度
                    const vLen: number = Buffer.byteLength(<string>ele.d, this._encoding);
                    this._org_buf.write(<string>ele.d, offset, ele.l, this._encoding);

                    // 补齐\0
                    for(let j = offset + vLen; j < offset + ele.l; j++){
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
                    let index: number = 0;
                    for(let i = offset; i < offset + ele.l; i ++){
                        if(index < (<Buffer>ele.d).length){
                            this._org_buf.writeUInt8(ele.d[index], i);
                        }else{
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

    /**
     * 未读数据长度
     */
    getAvailable() {
        if (!this._org_buf) {
            return this._offset;
        }
        return this._org_buf.length - this._offset;
    }
}
