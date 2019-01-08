
import {ExBuffer} from "../server/common/pack/ExBuffer";
import { ByteBuffer } from '../server/common/pack/ByteBuffer';
import * as net from "net";

// client
const exBuffer = new ExBuffer();
const client = net.connect(8125, "",function(){
    console.log(`client connect to server success`);
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

export const sendPack = (msg: string = `hello I am CL`)  =>{
    // send a packet
    var sbuf = new ByteBuffer();
    var buf = sbuf.uint32(55555).string(msg).pack(true);
    client.write(buf);
    console.log(`client send packet len:${JSON.stringify(buf)}`);
}

export const sendBigPack = () =>{
    var sbuf = new ByteBuffer();

    const msg = JSON.stringify({name: "cl", age: 25, sex: 1, lover: "awx", moves: ["三国演义", "射雕英雄传"]});

    var buf = sbuf.string(msg).pack(true);
    client.write(buf);
    console.log(`client send big packet len:${buf.length}`);
}

export const onSocketClose = () =>{
    client.emit("close");
}