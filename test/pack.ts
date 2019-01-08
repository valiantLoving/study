
import {ExBuffer} from "../server/common/pack/ExBuffer";
import { ByteBuffer } from '../server/common/pack/ByteBuffer';
import * as net from "net";

// 创建一个新的TCP或IPC服务
const server = net.createServer(function(socket){
    console.log(`client connect`);
    const exBuffer = new ExBuffer();
    exBuffer.on("data", function(buffer){
       console.log(`server receive packet, len:${buffer.length}`);
       
       // unpack the packet
       const bytebuf = new ByteBuffer(buffer);
       var resArr = bytebuf.uint32().string().unpack();
       console.log(`server unpack packet, resArr:${JSON.stringify(resArr)}`);

       // send a packet
       var sbuf = new ByteBuffer();
       var buf = sbuf.uint32("I Love AWX").string('welcome,client:' + resArr[0]).pack(true);
       socket.write(buf);
    });

    socket.on("data", function(data){
        console.log(`server receive socket data, len:${JSON.stringify(data)}`);
        exBuffer.put(data);
    });
});

server.listen(8124);
console.log('>> server start listening:');

// client
const exBuffer = new ExBuffer();
const client = net.connect(8124, "",function(){
    console.log(`client connect to server success`);

    // send a packet
    var sbuf = new ByteBuffer();
    var buf = sbuf.uint32(55555).string(`hello I am CL`).pack(true);
    client.write(buf);
    console.log(`client send packet len:${JSON.stringify(buf)}`);
});

client.on('data', function(data) {
    console.log('>> client receive socket data,length:'+data.length);
   exBuffer.put(data);//只要收到数据就往ExBuffer里面put
 });

//当客户端收到完整的数据包时
exBuffer.on('data', function(buffer) {
    console.log('>> client receive packet,length:'+buffer.length);
    //unpack the packet
    var bytebuf = new ByteBuffer(buffer);
    var resArr = bytebuf.uint32().string().unpack();
    console.log('>> client receive packet:['+resArr[0]+','+resArr[1]+']');
    //delay to exit
     console.log('exit...');
    setTimeout(function(){process.exit(0);},2000);
});
