
import { EventEmitter } from "events";
import { Buffer } from "buffer";

/**
 * 采用环形缓冲区，定义两个指针,分别指向有效数据的头和尾.在存放数据和删除数据时只是进行头尾指针的移动
 */
export class ExBuffer extends EventEmitter {

    /**包头的长度 */
    _headLen: number = 4;
    /**字节序写入顺序 */
    _endian: string = "B";
    /**缓冲区长度 buffer大于8kb,会使用slowBuffer,效率低,这里默认512 bytes */
    _buffer: Buffer;
    /**读偏移 有效数据头指针*/
    _readOffset: number = 0;
    /**写偏移 有效数据尾指针*/
    _putOffset: number = 0;
    /** 读取的字节序长度 */
    _dianLen: number = 0;

    constructor(bufferLength: number = 512) {
        super();
        this._buffer = Buffer.alloc(bufferLength);
    }

    /**
     * 指定包长是uint32型
     */
    uint32Head(): ExBuffer {
        this._headLen = 4;
        return this;
    }

    /**
     * 指定包长是ushort型
     */
    ushortHead(): ExBuffer {
        this._headLen = 2;
        return this;
    }

    /**
     * 指定小端存储字节序
     */
    littleEndian(): ExBuffer {
        this._endian = "L";
        return this;
    }

    /**
     * 指定大端存储字节序
     */
    bigEndian(): ExBuffer {
        this._endian = "B";
        return this;
    }

    /**
     * 获取已使用的缓冲区长度
     * 
     */
    getUsedLen(): number {
        if (this._putOffset >= this._readOffset) {
            return this._putOffset - this._readOffset;
        }
        return this._buffer.length - this._readOffset + this._putOffset;
    }

    /**
     * 接收buffer到缓冲区
     * @param buffer 
     * @param offset 
     * @param len 
     */
    put(buffer: Buffer, offset: number = 0, len?: number) {
        if (!len) {
            // 接受buffer的有效长度
            len = buffer.length - offset;
        }
        const usedLen: number = this.getUsedLen();
        console.log(`当前缓冲区情况, len:${len}, usedLen:${usedLen}`);
        // 当前缓冲区剩余空间不足存储本次数据
        if (len + usedLen >= this._buffer.length) {
            // 每次扩展1kb
            const ex = Math.ceil((len + usedLen + 1) / 1024);
            const tempBuffer: Buffer = Buffer.alloc(ex * 1024);
            const exLen: number = tempBuffer.length - this._buffer.length;
            // 将原buffer拷贝到新buffer中
            this._buffer.copy(tempBuffer);
            // 修正缓冲区标记的头尾指针(尾指针比头指针小的情况)
            if (this._putOffset < this._readOffset) {
                // 新缓冲区(大环)完全包裹原缓冲区(小环)
                if (this._putOffset <= exLen) {
                    // 将原缓冲区写入偏移部分(开始->尾部)放入新缓冲区
                    tempBuffer.copy(tempBuffer, this._buffer.length, 0, this._putOffset);
                    this._putOffset += this._buffer.length;
                } else {
                    // 大环无法完全包裹小环
                    tempBuffer.copy(tempBuffer, this._buffer.length, 0, exLen);
                    tempBuffer.copy(tempBuffer, 0, exLen, this._putOffset);
                    this._putOffset -= exLen;
                }
            }
            // 使用新缓冲区
            this._buffer = tempBuffer;
        }

        if (this.getUsedLen() == 0) {
            this._putOffset = this._readOffset = 0;
        }

        // 判断是否会冲破_buffer的尾部
        if (this._putOffset + len > this._buffer.length) {
            // 分两次存 (一次从写入偏移出写到环尾<首>, 一次从环首开始写)
            const len1 = this._buffer.length - this._putOffset;
            if (len1 > 0) {
                buffer.copy(this._buffer, this._putOffset, offset, offset + len1);
                offset += len1;
            }
            const len2 = len - len1;
            buffer.copy(this._buffer, 0, offset, offset + len2);
            this._putOffset = len2;
        } else {
            buffer.copy(this._buffer, this._putOffset, offset, offset + len);
            this._putOffset += len;
        }
        console.log(`=========put======== ${JSON.stringify(this)}`);
        this.proc();
    }

    /**
     * 循环解包，
     * 首先我们要保证，起始的位置就是包头位置，前面的数据均为垃圾数据，因为每次截取一个完整包之后，理论上接下来的数据应该就是包头
     */
    proc() {
        let count: number = 0;
        while (true) {
            count++;
            if (count > 1000) {
                break;
            }
            console.log(`循环解包, usedLen:${this.getUsedLen()}, _dianLen:${this._dianLen}`);
            if (this._dianLen == 0) {
                if (this.getUsedLen() < this._headLen) {
                    // 长度不够包头
                    break;
                }
                // 读取字节序
                if (this._buffer.length - this._readOffset >= this._headLen) {
                    //用指定的字节序格式（readInt32BE() 返回大端序，readInt32LE() 返回小端序）从 buf 中指定的 offset 读取一个有符号的 * 位整数值。
                    //从 Buffer 中读取的整数值会被解析为二进制补码值。
                    this._dianLen = this._buffer[`readUInt${8 * this._headLen}${this._endian}E`](this._readOffset);
                    this._readOffset += this._dianLen;
                    console.log(`==========1=====, _dianLen:${this._dianLen}, readOffset:${this._readOffset}`);
                } else {
                    const headBufer = Buffer.alloc(this._headLen);
                    var rlen: number = 0;
                    const tailLen = this._buffer.length - this._readOffset;
                    // 将头指针到包尾的数据放入新包头,然后继续从包开始处读取数据放入新包头直到形成指定大小的包头
                    for (let i = 0; i < tailLen; i++) {
                        console.log(`*****缓冲区末尾不足 包头长度*****`);
                        headBufer[i] = this._buffer[this._readOffset++];
                        rlen++;
                    }
                    this._readOffset = 0;
                    for (let i = 0; i < (this._headLen - rlen); i++) {
                        headBufer[rlen + i] = this._buffer[this._readOffset++];
                    }
                    this._dianLen = headBufer[`readUInt${8 * this._headLen}${this._endian}E`](0);
                    console.log(`==========2=====, _dianLen:${this._dianLen}, readOffset:${this._readOffset}`);
                }
            }

            if (this.getUsedLen() >= this._dianLen) {
                const endianBuffer = Buffer.alloc(this._dianLen);
                console.log(`==========3=====, _dianLen:${this._dianLen}, usedLen:${this.getUsedLen()}, _readOffset:${this._readOffset}`);
                if (this._readOffset + this._dianLen > this._buffer.length) {
                    var len1 = this._buffer.length - this._readOffset;
                    if (len1 > 0) {
                        this._buffer.copy(endianBuffer, 0, this._readOffset, this._readOffset + len1);
                    }
                    this._readOffset = 0;
                    var len2 = this._dianLen - len1;
                    this._buffer.copy(endianBuffer, len1, this._readOffset, this._readOffset + len2);
                    this._readOffset += len2;
                } else {
                    this._buffer.copy(endianBuffer, 0, this._readOffset, this._readOffset + this._dianLen);
                    this._readOffset += this._dianLen;
                }
                console.log(`==========4=====, _dianLen:${this._dianLen}, usedLen:${this.getUsedLen()}, _readOffset:${this._readOffset}, endianBuffer:${JSON.stringify(endianBuffer)}`);
                try {
                    this._dianLen = 0;
                    this.emit("data", endianBuffer);
                    if (this._readOffset === this._putOffset) {
                        break;
                    }
                } catch (e) {
                    this.emit("error", e);
                }
            } else {
                break;
            }
        }
    }
}