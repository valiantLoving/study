"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repl = require("repl");
const client_1 = require("./client");
let isExecuting = false;
repl.start({ prompt: 'ST Roobot::Runing >>>', eval: main });
function main(cmd) {
    cmd = cmd.trim().toString();
    const arr = cmd.split(",");
    cmd = arr[0];
    console.log('当前cmd:', cmd);
    if (isExecuting) {
        console.log('正在执行', cmd);
        return;
    }
    else {
        console.log('执行完毕');
        isExecuting = true;
    }
    if (cmd === 'send') {
        console.log(`发送包 ${cmd}`);
        client_1.sendPack(arr[1]);
        isExecuting = false;
    }
    else if (cmd == "sendBig") {
        client_1.sendBigPack();
        isExecuting = false;
    }
}
process.on("uncaughtException", function (err) {
    console.log(`uncaughtException:${JSON.stringify(err)}`);
});
