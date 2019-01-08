import { Socket } from "net";
import { ExBuffer } from "../pack/ExBuffer";
import { ByteBuffer } from "../pack/ByteBuffer";
import * as _ from "underscore";
import moment = require("moment");
import { EncryptoTool } from "../EncryptoTool";
import { deflate } from "zlib";
import *  as R from "ramda";
import Promise = require("bluebird");
// global.Promise = require("bluebird");
const deflateAsync = Promise.promisify(deflate);

/**socket状态 */
export enum ESocketStatus {
    UNOPEN = 1,
    CONNECTED = 2,
    CLOSE = 3
}

export abstract class Client {
    /**客户端的socket连接 */
    _socket: Socket;
    /**客户端的ip */
    _ip: string;
    /**客户端的端口 */
    _port: number;
    /**连接时间 */
    _connectTime: number;
    /**持有该客户端的服务器对象 */
    _server: any;
    _status: ESocketStatus;

    _exBuffer: ExBuffer;

    constructor(socket: Socket, ip: string, port: number, server: any) {
        this._ip = ip;
        this._port = port;
        this._server = server;
        this._status = ESocketStatus.UNOPEN;

        if (socket) {
            this._socket = socket;
            this._socket.on("data", _.bind(this.onSocketData, this));
            // socket 完全关闭就发出该事件
            this._socket.on("close", _.bind(this.onSocketClose, this));
            // 当错误发生时触发,'close' 事件也会紧接着该事件被触发
            this._socket.on("error", _.bind(this.onSocketError, this));
            // 当socket的另一端发送一个FIN包的时候触发,从而结束socket的可读端
            this._socket.on("end", _.bind(this.onSocketEnd, this));

            this._status = ESocketStatus.CONNECTED;
        }
        this._exBuffer = new ExBuffer();
        this._exBuffer.uint32Head();
        this._exBuffer.on("data", _.bind(this.onExBufferPacket, this));
        this._connectTime = moment().unix();

        return this;
    }

    socketAdd(): string {
        return `ip:${this._ip}, port:${this._port}`;
    }

    /**
     * socket接收到数据,放入ExBuffer缓冲区
     * @param data
     */
    onSocketData(data: Buffer) {
        if (this._exBuffer) {
            this._exBuffer.put(data);
        }
    }

    /**
     * 销毁socket
     */
    destroySocket() {
        if (this._socket) {
            //半关闭socket,例如发送一个FIN包,服务端仍可以发送数据
            //如果指定了data,则相当于调用 socket.write(data, encoding) 之后再调用 socket.end()
            this._socket.end();
            // 确保在该 socket 上不再有 I/O 活动
            this._socket.destroy();

            this._status = ESocketStatus.CLOSE;
            this._exBuffer = null;
            console.log(`成功销毁socket, ${this.socketAdd()}`);
        }
    }

    /**
     * 处理socket的error事件
     * @param err
     */
    onSocketError(err: Error) {
        console.error(`${this.socketAdd()} socket error: ${JSON.stringify(err)}`);
        this._status = ESocketStatus.CLOSE;
    }

    /**
     * 处理socket的end事件
     */
    onSocketEnd() {
        console.error(`${this.socketAdd} 收到客户端发来的 FIN packet, 准备销毁服务端socket句柄`);
        this._status = ESocketStatus.CLOSE;
    }

    /**
     * 处理socket的超时
     */
    onSocketTimeout() {
        console.log(`${this.socketAdd} socket 客户端在15秒钟没有发包（包括心跳包）过来，可能意外掉线了，现在关闭连接!`);
        this._socket.destroy();
        this._status = ESocketStatus.CLOSE;
    }

    /**
     * 踢出玩家
     */
    onSocketKickOutPlayer() {
        console.log(`${this.socketAdd} kick out player`);
        this._socket.end();
        this._status = ESocketStatus.CLOSE;
    }

    /**
     * 处理socket的close事件
     */
    onSocketClose(had_error: boolean): boolean {
        console.log(`${this.socketAdd()} close socket!`);
        this.destroySocket();
        if (this._server) {
            const opRes = this._server.onCliSocketClose(this._ip, this._port);
            if (opRes) {
                console.log(`remove ${this.socketAdd()} from server ${opRes}`);
                return true;
            } else {
                console.error(`remove ${this.socketAdd()} from server fail`);
            }
        }
        return false;
    }

    abstract onExBufferPacket(buffer: Buffer): void;

    /**
     * 将json对象ByteBuffer化
     * @param jsonObj 
     */
    static bufferifyObj(jsonObj: any): Buffer {
        const jsonStr: string = JSON.stringify(jsonObj);
        // 使用aes加密
        const encodingStr: string = EncryptoTool.aes_encode(jsonStr);

        const byteBuffer = new ByteBuffer();
        byteBuffer.string(encodingStr);
        return byteBuffer.pack();
    }

    /**
     * 将数据包对象序列化并加密压缩
     */
    static async encodeAndCompress(jsonObj: any): Promise<Buffer> {
        const data: Buffer = await this.compressPacket(this.bufferifyObj(jsonObj));
        return data;
    }

    /**
     * 压缩buffer并打包成ExBuffer的通讯包
     * @param buffer
     */
    static async compressPacket(buffer: Buffer): Promise<Buffer> {
        // 异步压缩
        const deflateBuf: Buffer = <Buffer>(await deflateAsync(buffer));

        const byteBuf: ByteBuffer = new ByteBuffer();
        byteBuf.byteArray(deflateBuf.length, deflateBuf);

        return byteBuf.pack(true);
    }

    /**
     * 发送json数据包
     */
    static async sendData(cli: Client, jsonObj: any, isAwait: boolean = false): Promise<boolean> {
        if (!cli || R.isNil(jsonObj)) {
            return false;
        }
        const objBuffer: Buffer = this.bufferifyObj(jsonObj);
        if (isAwait) {
            await this.sendBufferData(cli, objBuffer);
        } else {
            this.sendBufferData(cli, objBuffer);
        }
        return true;
    }

    /**
     * 发送二进制数据包
     * @param cli 
     * @param bufferData 
     */
    static async sendBufferData(cli: Client, bufferData: Buffer): Promise<void> {
        try {
            if (cli._socket && cli._status == ESocketStatus.CONNECTED) {
                const sendBuffer: Buffer = await this.compressPacket(bufferData);
                cli._socket.write(sendBuffer, "utf8", function () {
                    console.log(`send data success! ${sendBuffer.length} bytes`);
                });
            } else {
                console.error(`send data error, client socket is null or  socket is closed!`);
                cli.destroySocket();
            }
        } catch (e) {
            console.error(`there are some error occur when send buffer data, e:${JSON.stringify(e.stack)}`);
            cli.destroySocket();
        }
    }
}