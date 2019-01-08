
import {ExBuffer} from "../server/common/pack/ExBuffer";
import { ByteBuffer } from '../server/common/pack/ByteBuffer';
import * as net from "net";

// 创建一个新的TCP或IPC服务
const server = net.createServer(function(socket){
    console.log(`client connect`);
    const exBuffer = new ExBuffer();
    exBuffer.on("data", function(buffer){
       console.log(`server receive packet, len:${JSON.stringify(buffer)}`);
       
       // unpack the packet
       const bytebuf = new ByteBuffer(buffer);
       var resArr = bytebuf.uint32(5555).string().unpack();
       console.log(`server unpack packet, resArr:${JSON.stringify(resArr)}`);

       // send a packet
       var sbuf = new ByteBuffer();
       var buf = sbuf.uint32(5555).string('welcome,client:' + resArr[0]).pack(true);
       socket.write(buf);
    });

    socket.on("data", function(data){
        console.log(`server receive socket data, len:${JSON.stringify(data)}`);
        exBuffer.put(data);
        console.log(`put data in exBuffer:${JSON.stringify(exBuffer)}`);
    });

    socket.on("close", function(){
        socket.destroy();
    })
});

server.listen(8125);
console.log('>> server start listening:');