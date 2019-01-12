"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ExBuffer_1 = require("../pack/ExBuffer");
var ByteBuffer_1 = require("../pack/ByteBuffer");
var _ = __importStar(require("underscore"));
var moment = require("moment");
var EncryptoTool_1 = require("../EncryptoTool");
var zlib_1 = require("zlib");
var R = __importStar(require("ramda"));
var Bluebird = require("bluebird");
var deflateAsync = Bluebird.promisify(zlib_1.deflate);
var ESocketStatus;
(function (ESocketStatus) {
    ESocketStatus[ESocketStatus["UNOPEN"] = 1] = "UNOPEN";
    ESocketStatus[ESocketStatus["CONNECTED"] = 2] = "CONNECTED";
    ESocketStatus[ESocketStatus["CLOSE"] = 3] = "CLOSE";
})(ESocketStatus = exports.ESocketStatus || (exports.ESocketStatus = {}));
var Client = (function () {
    function Client(socket, ip, port, server) {
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
    Client.prototype.socketAdd = function () {
        return "ip:" + this._ip + ", port:" + this._port;
    };
    Client.prototype.onSocketData = function (data) {
        if (this._exBuffer) {
            this._exBuffer.put(data);
        }
    };
    Client.prototype.destroySocket = function () {
        if (this._socket) {
            this._socket.end();
            this._socket.destroy();
            this._status = ESocketStatus.CLOSE;
            this._exBuffer = null;
            console.log("\u6210\u529F\u9500\u6BC1socket, " + this.socketAdd());
        }
    };
    Client.prototype.onSocketError = function (err) {
        console.error(this.socketAdd() + " socket error: " + JSON.stringify(err));
        this._status = ESocketStatus.CLOSE;
    };
    Client.prototype.onSocketEnd = function () {
        console.error(this.socketAdd + " \u6536\u5230\u5BA2\u6237\u7AEF\u53D1\u6765\u7684 FIN packet, \u51C6\u5907\u9500\u6BC1\u670D\u52A1\u7AEFsocket\u53E5\u67C4");
        this._status = ESocketStatus.CLOSE;
    };
    Client.prototype.onSocketTimeout = function () {
        console.log(this.socketAdd + " socket \u5BA2\u6237\u7AEF\u572815\u79D2\u949F\u6CA1\u6709\u53D1\u5305\uFF08\u5305\u62EC\u5FC3\u8DF3\u5305\uFF09\u8FC7\u6765\uFF0C\u53EF\u80FD\u610F\u5916\u6389\u7EBF\u4E86\uFF0C\u73B0\u5728\u5173\u95ED\u8FDE\u63A5!");
        this._socket.destroy();
        this._status = ESocketStatus.CLOSE;
    };
    Client.prototype.onSocketKickOutPlayer = function () {
        console.log(this.socketAdd + " kick out player");
        this._socket.end();
        this._status = ESocketStatus.CLOSE;
    };
    Client.prototype.onSocketClose = function (had_error) {
        console.log(this.socketAdd() + " close socket!");
        this.destroySocket();
        if (this._server) {
            var opRes = this._server.onCliSocketClose(this._ip, this._port);
            if (opRes) {
                console.log("remove " + this.socketAdd() + " from server " + opRes);
                return true;
            }
            else {
                console.error("remove " + this.socketAdd() + " from server fail");
            }
        }
        return false;
    };
    Client.bufferifyObj = function (jsonObj) {
        var jsonStr = JSON.stringify(jsonObj);
        var encodingStr = EncryptoTool_1.EncryptoTool.aes_encode(jsonStr);
        var byteBuffer = new ByteBuffer_1.ByteBuffer();
        byteBuffer.string(encodingStr);
        return byteBuffer.pack();
    };
    Client.encodeAndCompress = function (jsonObj) {
        return __awaiter(this, void 0, Bluebird, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.compressPacket(this.bufferifyObj(jsonObj))];
                    case 1:
                        data = _a.sent();
                        return [2, data];
                }
            });
        });
    };
    Client.compressPacket = function (buffer) {
        return __awaiter(this, void 0, Bluebird, function () {
            var deflateBuf, byteBuf;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, deflateAsync(buffer)];
                    case 1:
                        deflateBuf = (_a.sent());
                        byteBuf = new ByteBuffer_1.ByteBuffer();
                        byteBuf.byteArray(deflateBuf.length, deflateBuf);
                        return [2, byteBuf.pack(true)];
                }
            });
        });
    };
    Client.sendData = function (cli, jsonObj, isAwait) {
        if (isAwait === void 0) { isAwait = false; }
        return __awaiter(this, void 0, Bluebird, function () {
            var objBuffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!cli || R.isNil(jsonObj)) {
                            return [2, false];
                        }
                        objBuffer = this.bufferifyObj(jsonObj);
                        if (!isAwait) return [3, 2];
                        return [4, this.sendBufferData(cli, objBuffer)];
                    case 1:
                        _a.sent();
                        return [3, 3];
                    case 2:
                        this.sendBufferData(cli, objBuffer);
                        _a.label = 3;
                    case 3: return [2, true];
                }
            });
        });
    };
    Client.sendBufferData = function (cli, bufferData) {
        return __awaiter(this, void 0, Bluebird, function () {
            var sendBuffer_1, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!(cli._socket && cli._status == ESocketStatus.CONNECTED)) return [3, 2];
                        return [4, this.compressPacket(bufferData)];
                    case 1:
                        sendBuffer_1 = _a.sent();
                        cli._socket.write(sendBuffer_1, "utf8", function () {
                            console.log("send data success! " + sendBuffer_1.length + " bytes");
                        });
                        return [3, 3];
                    case 2:
                        console.error("send data error, client socket is null or  socket is closed!");
                        cli.destroySocket();
                        _a.label = 3;
                    case 3: return [3, 5];
                    case 4:
                        e_1 = _a.sent();
                        console.error("there are some error occur when send buffer data, e:" + JSON.stringify(e_1.stack));
                        cli.destroySocket();
                        return [3, 5];
                    case 5: return [2];
                }
            });
        });
    };
    return Client;
}());
exports.Client = Client;
