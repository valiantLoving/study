"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ExBuffer_1 = require("../server/common/pack/ExBuffer");
var ByteBuffer_1 = require("../server/common/pack/ByteBuffer");
var net = __importStar(require("net"));
var server = net.createServer(function (socket) {
    console.log("client connect");
    var exBuffer = new ExBuffer_1.ExBuffer();
    exBuffer.on("data", function (buffer) {
        console.log("server receive packet, len:" + JSON.stringify(buffer));
        var bytebuf = new ByteBuffer_1.ByteBuffer(buffer);
        var resArr = bytebuf.uint32(5555).string().unpack();
        console.log("server unpack packet, resArr:" + JSON.stringify(resArr));
        var sbuf = new ByteBuffer_1.ByteBuffer();
        var buf = sbuf.uint32(5555).string('welcome,client:' + resArr[0]).pack(true);
        socket.write(buf);
    });
    socket.on("data", function (data) {
        console.log("server receive socket data, len:" + JSON.stringify(data));
        exBuffer.put(data);
        console.log("put data in exBuffer:" + JSON.stringify(exBuffer));
    });
    socket.on("close", function () {
        socket.destroy();
    });
});
server.listen(8125);
console.log('>> server start listening:');
