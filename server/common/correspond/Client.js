"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ExBuffer_1 = require("../pack/ExBuffer");
const ByteBuffer_1 = require("../pack/ByteBuffer");
const _ = __importStar(require("underscore"));
const moment = require("moment");
const EncryptoTool_1 = require("../EncryptoTool");
const zlib_1 = require("zlib");
const R = __importStar(require("ramda"));
const Promise = require("bluebird");
const deflateAsync = Promise.promisify(zlib_1.deflate);
var ESocketStatus;
(function (ESocketStatus) {
    ESocketStatus[ESocketStatus["UNOPEN"] = 1] = "UNOPEN";
    ESocketStatus[ESocketStatus["CONNECTED"] = 2] = "CONNECTED";
    ESocketStatus[ESocketStatus["CLOSE"] = 3] = "CLOSE";
})(ESocketStatus = exports.ESocketStatus || (exports.ESocketStatus = {}));
class Client {
    constructor(socket, ip, port, server) {
        this._ip = ip;
        this._port = port;
        this._server = server;
        this._status = ESocketStatus.UNOPEN;
        if (socket) {
            this._socket = socket;
            this._socket.on("data", _.bind(this.onSocketData, this));
            this._socket.on("close", _.bind(this.onSocketClose, this));
            this._socket.on("error", _.bind(this.onSocketError, this));
            this._socket.on("end", _.bind(this.onSocketEnd, this));
            this._status = ESocketStatus.CONNECTED;
        }
        this._exBuffer = new ExBuffer_1.ExBuffer();
        this._exBuffer.uint32Head();
        this._exBuffer.on("data", _.bind(this.onExBufferPacket, this));
        this._connectTime = moment().unix();
        return this;
    }
    socketAdd() {
        return `ip:${this._ip}, port:${this._port}`;
    }
    onSocketData(data) {
        if (this._exBuffer) {
            this._exBuffer.put(data);
        }
    }
    destroySocket() {
        if (this._socket) {
            this._socket.end();
            this._socket.destroy();
            this._status = ESocketStatus.CLOSE;
            this._exBuffer = null;
            console.log(`成功销毁socket, ${this.socketAdd()}`);
        }
    }
    onSocketError(err) {
        console.error(`${this.socketAdd()} socket error: ${JSON.stringify(err)}`);
        this._status = ESocketStatus.CLOSE;
    }
    onSocketEnd() {
        console.error(`${this.socketAdd} 收到客户端发来的 FIN packet, 准备销毁服务端socket句柄`);
        this._status = ESocketStatus.CLOSE;
    }
    onSocketTimeout() {
        console.log(`${this.socketAdd} socket 客户端在15秒钟没有发包（包括心跳包）过来，可能意外掉线了，现在关闭连接!`);
        this._socket.destroy();
        this._status = ESocketStatus.CLOSE;
    }
    onSocketKickOutPlayer() {
        console.log(`${this.socketAdd} kick out player`);
        this._socket.end();
        this._status = ESocketStatus.CLOSE;
    }
    onSocketClose(had_error) {
        console.log(`${this.socketAdd()} close socket!`);
        this.destroySocket();
        if (this._server) {
            const opRes = this._server.onCliSocketClose(this._ip, this._port);
            if (opRes) {
                console.log(`remove ${this.socketAdd()} from server ${opRes}`);
                return true;
            }
            else {
                console.error(`remove ${this.socketAdd()} from server fail`);
            }
        }
        return false;
    }
    static bufferifyObj(jsonObj) {
        const jsonStr = JSON.stringify(jsonObj);
        const encodingStr = EncryptoTool_1.EncryptoTool.aes_encode(jsonStr);
        const byteBuffer = new ByteBuffer_1.ByteBuffer();
        byteBuffer.string(encodingStr);
        return byteBuffer.pack();
    }
    static encodeAndCompress(jsonObj) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.compressPacket(this.bufferifyObj(jsonObj));
            return data;
        });
    }
    static compressPacket(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const deflateBuf = (yield deflateAsync(buffer));
            const byteBuf = new ByteBuffer_1.ByteBuffer();
            byteBuf.byteArray(deflateBuf.length, deflateBuf);
            return byteBuf.pack(true);
        });
    }
    static sendData(cli, jsonObj, isAwait = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!cli || R.isNil(jsonObj)) {
                return false;
            }
            const objBuffer = this.bufferifyObj(jsonObj);
            if (isAwait) {
                yield this.sendBufferData(cli, objBuffer);
            }
            else {
                this.sendBufferData(cli, objBuffer);
            }
            return true;
        });
    }
    static sendBufferData(cli, bufferData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (cli._socket && cli._status == ESocketStatus.CONNECTED) {
                    const sendBuffer = yield this.compressPacket(bufferData);
                    cli._socket.write(sendBuffer, "utf8", function () {
                        console.log(`send data success! ${sendBuffer.length} bytes`);
                    });
                }
                else {
                    console.error(`send data error, client socket is null or  socket is closed!`);
                    cli.destroySocket();
                }
            }
            catch (e) {
                console.error(`there are some error occur when send buffer data, e:${JSON.stringify(e.stack)}`);
                cli.destroySocket();
            }
        });
    }
}
exports.Client = Client;
