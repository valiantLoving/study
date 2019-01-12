"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var buffer_1 = require("buffer");
var ExBuffer = (function (_super) {
    __extends(ExBuffer, _super);
    function ExBuffer(bufferLength) {
        if (bufferLength === void 0) { bufferLength = 512; }
        var _this = _super.call(this) || this;
        _this._headLen = 4;
        _this._endian = "B";
        _this._readOffset = 0;
        _this._putOffset = 0;
        _this._dianLen = 0;
        _this._buffer = buffer_1.Buffer.alloc(bufferLength);
        return _this;
    }
    ExBuffer.prototype.uint32Head = function () {
        this._headLen = 4;
        return this;
    };
    ExBuffer.prototype.ushortHead = function () {
        this._headLen = 2;
        return this;
    };
    ExBuffer.prototype.littleEndian = function () {
        this._endian = "L";
        return this;
    };
    ExBuffer.prototype.bigEndian = function () {
        this._endian = "B";
        return this;
    };
    ExBuffer.prototype.getUsedLen = function () {
        if (this._putOffset >= this._readOffset) {
            return this._putOffset - this._readOffset;
        }
        return this._buffer.length - this._readOffset + this._putOffset;
    };
    ExBuffer.prototype.put = function (buffer, offset, len) {
        if (offset === void 0) { offset = 0; }
        if (!len) {
            len = buffer.length - offset;
        }
        var usedLen = this.getUsedLen();
        console.log("\u5F53\u524D\u7F13\u51B2\u533A\u60C5\u51B5, len:" + len + ", usedLen:" + usedLen);
        if (len + usedLen >= this._buffer.length) {
            var ex = Math.ceil((len + usedLen + 1) / 1024);
            var tempBuffer = buffer_1.Buffer.alloc(ex * 1024);
            var exLen = tempBuffer.length - this._buffer.length;
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
            var len1 = this._buffer.length - this._putOffset;
            if (len1 > 0) {
                buffer.copy(this._buffer, this._putOffset, offset, offset + len1);
                offset += len1;
            }
            var len2 = len - len1;
            buffer.copy(this._buffer, 0, offset, offset + len2);
            this._putOffset = len2;
        }
        else {
            buffer.copy(this._buffer, this._putOffset, offset, offset + len);
            this._putOffset += len;
        }
        console.log("=========put======== " + JSON.stringify(this));
        this.proc();
    };
    ExBuffer.prototype.proc = function () {
        var count = 0;
        while (true) {
            count++;
            if (count > 1000) {
                break;
            }
            console.log("\u5FAA\u73AF\u89E3\u5305, usedLen:" + this.getUsedLen() + ", _dianLen:" + this._dianLen);
            if (this._dianLen == 0) {
                if (this.getUsedLen() < this._headLen) {
                    break;
                }
                if (this._buffer.length - this._readOffset >= this._headLen) {
                    this._dianLen = this._buffer["readUInt" + 8 * this._headLen + this._endian + "E"](this._readOffset);
                    this._readOffset += this._dianLen;
                    console.log("==========1=====, _dianLen:" + this._dianLen + ", readOffset:" + this._readOffset);
                }
                else {
                    var headBufer = buffer_1.Buffer.alloc(this._headLen);
                    var rlen = 0;
                    var tailLen = this._buffer.length - this._readOffset;
                    for (var i = 0; i < tailLen; i++) {
                        console.log("*****\u7F13\u51B2\u533A\u672B\u5C3E\u4E0D\u8DB3 \u5305\u5934\u957F\u5EA6*****");
                        headBufer[i] = this._buffer[this._readOffset++];
                        rlen++;
                    }
                    this._readOffset = 0;
                    for (var i = 0; i < (this._headLen - rlen); i++) {
                        headBufer[rlen + i] = this._buffer[this._readOffset++];
                    }
                    this._dianLen = headBufer["readUInt" + 8 * this._headLen + this._endian + "E"](0);
                    console.log("==========2=====, _dianLen:" + this._dianLen + ", readOffset:" + this._readOffset);
                }
            }
            if (this.getUsedLen() >= this._dianLen) {
                var endianBuffer = buffer_1.Buffer.alloc(this._dianLen);
                console.log("==========3=====, _dianLen:" + this._dianLen + ", usedLen:" + this.getUsedLen() + ", _readOffset:" + this._readOffset);
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
                console.log("==========4=====, _dianLen:" + this._dianLen + ", usedLen:" + this.getUsedLen() + ", _readOffset:" + this._readOffset + ", endianBuffer:" + JSON.stringify(endianBuffer));
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
    };
    return ExBuffer;
}(events_1.EventEmitter));
exports.ExBuffer = ExBuffer;
