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
        console.log("server receive packet, len:" + buffer.length);
        var bytebuf = new ByteBuffer_1.ByteBuffer(buffer);
        var resArr = bytebuf.uint32().string().unpack();
        console.log("server unpack packet, resArr:" + JSON.stringify(resArr));
        var sbuf = new ByteBuffer_1.ByteBuffer();
        var buf = sbuf.uint32("I Love AWX").string('welcome,client:' + resArr[0]).pack(true);
        socket.write(buf);
    });
    socket.on("data", function (data) {
        console.log("server receive socket data, len:" + JSON.stringify(data));
        exBuffer.put(data);
    });
});
server.listen(8124);
console.log('>> server start listening:');
var exBuffer = new ExBuffer_1.ExBuffer();
var client = net.connect(8124, "", function () {
    console.log("client connect to server success");
    var sbuf = new ByteBuffer_1.ByteBuffer();
    var buf = sbuf.uint32(55555).string("hello I am CL").pack(true);
    client.write(buf);
    console.log("client send packet len:" + JSON.stringify(buf));
});
client.on('data', function (data) {
    console.log('>> client receive socket data,length:' + data.length);
    exBuffer.put(data);
});
exBuffer.on('data', function (buffer) {
    console.log('>> client receive packet,length:' + buffer.length);
    var bytebuf = new ByteBuffer_1.ByteBuffer(buffer);
    var resArr = bytebuf.uint32().string().unpack();
    console.log('>> client receive packet:[' + resArr[0] + ',' + resArr[1] + ']');
    console.log('exit...');
    setTimeout(function () { process.exit(0); }, 2000);
});
