"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const buffer_1 = require("buffer");
class ExBuffer extends events_1.EventEmitter {
    constructor(bufferLength = 512) {
        super();
        this._headLen = 4;
        this._endian = "B";
        this._readOffset = 0;
        this._putOffset = 0;
        this._dianLen = 0;
        this._buffer = buffer_1.Buffer.alloc(bufferLength);
    }
    uint32Head() {
        this._headLen = 4;
        return this;
    }
    ushortHead() {
        this._headLen = 2;
        return this;
    }
    littleEndian() {
        this._endian = "L";
        return this;
    }
    bigEndian() {
        this._endian = "B";
        return this;
    }
    getUsedLen() {
        if (this._putOffset >= this._readOffset) {
            return this._putOffset - this._readOffset;
        }
        return this._buffer.length - this._readOffset + this._putOffset;
    }
    put(buffer, offset = 0, len) {
        if (!len) {
            len = buffer.length - offset;
        }
        const usedLen = this.getUsedLen();
        console.log(`当前缓冲区情况, len:${len}, usedLen:${usedLen}`);
        if (len + usedLen >= this._buffer.length) {
            const ex = Math.ceil((len + usedLen + 1) / 1024);
            const tempBuffer = buffer_1.Buffer.alloc(ex * 1024);
            const exLen = tempBuffer.length - this._buffer.length;
            this._buffer.copy(tempBuffer);
            if (this._putOffset < this._readOffset) {
                if (this._putOffset <= exLen) {
                    tempBuffer.copy(tempBuffer, this._buffer.length, 0, this._putOffset);
                    this._putOffset += this._buffer.length;
                }
                else {
                    tempBuffer.copy(tempBuffer, this._buffer.length, 0, exLen);
                    tempBuffer.copy(tempBuffer, 0, exLen, this._putOffset);
                    this._putOffset -= exLen;
                }
            }
            this._buffer = tempBuffer;
        }
        if (this.getUsedLen() == 0) {
            this._putOffset = this._readOffset = 0;
        }
        if (this._putOffset + len > this._buffer.length) {
            const len1 = this._buffer.length - this._putOffset;
            if (len1 > 0) {
                buffer.copy(this._buffer, this._putOffset, offset, offset + len1);
                offset += len1;
            }
            const len2 = len - len1;
            buffer.copy(this._buffer, 0, offset, offset + len2);
            this._putOffset = len2;
        }
        else {
            buffer.copy(this._buffer, this._putOffset, offset, offset + len);
            this._putOffset += len;
        }
        console.log(`=========put======== ${JSON.stringify(this)}`);
        this.proc();
    }
    proc() {
        let count = 0;
        while (true) {
            count++;
            if (count > 1000) {
                break;
            }
            console.log(`循环解包, usedLen:${this.getUsedLen()}, _dianLen:${this._dianLen}`);
            if (this._dianLen == 0) {
                if (this.getUsedLen() < this._headLen) {
                    break;
                }
                if (this._buffer.length - this._readOffset >= this._headLen) {
                    this._dianLen = this._buffer[`readUInt${8 * this._headLen}${this._endian}E`](this._readOffset);
                    this._readOffset += this._dianLen;
                    console.log(`==========1=====, _dianLen:${this._dianLen}, readOffset:${this._readOffset}`);
                }
                else {
                    const headBufer = buffer_1.Buffer.alloc(this._headLen);
                    var rlen = 0;
                    const tailLen = this._buffer.length - this._readOffset;
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
                const endianBuffer = buffer_1.Buffer.alloc(this._dianLen);
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
                }
                else {
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
                }
                catch (e) {
                    this.emit("error", e);
                }
            }
            else {
                break;
            }
        }
    }
}
exports.ExBuffer = ExBuffer;
