"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var repl = require("repl");
var client_1 = require("./client");
var isExecuting = false;
repl.start({ prompt: 'ST Roobot::Runing >>>', eval: main });
function main(cmd) {
    cmd = cmd.trim().toString();
    var arr = cmd.split(",");
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
        console.log("\u53D1\u9001\u5305 " + cmd);
        client_1.sendPack(arr[1]);
        isExecuting = false;
    }
    else if (cmd == "sendBig") {
        client_1.sendBigPack();
        isExecuting = false;
    }
}
process.on("uncaughtException", function (err) {
    console.log("uncaughtException:" + JSON.stringify(err));
});
