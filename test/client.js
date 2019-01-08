"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ExBuffer_1 = require("../server/common/pack/ExBuffer");
const ByteBuffer_1 = require("../server/common/pack/ByteBuffer");
const net = __importStar(require("net"));
const exBuffer = new ExBuffer_1.ExBuffer();
const client = net.connect(8125, "", function () {
    console.log(`client connect to server success`);
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
exports.sendPack = (msg = `hello I am CL`) => {
    var sbuf = new ByteBuffer_1.ByteBuffer();
    var buf = sbuf.uint32(55555).string(msg).pack(true);
    client.write(buf);
    console.log(`client send packet len:${JSON.stringify(buf)}`);
};
exports.sendBigPack = () => {
    var sbuf = new ByteBuffer_1.ByteBuffer();
    const msg = JSON.stringify({ name: "cl", age: 25, sex: 1, lover: "awx", moves: ["三国演义", "射雕英雄传"] });
    var buf = sbuf.string(msg).pack(true);
    client.write(buf);
    console.log(`client send big packet len:${buf.length}`);
};
exports.onSocketClose = () => {
    client.emit("close");
};
