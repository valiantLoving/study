"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var str = "";
var num = 0;
for (var i = 1; i <= 7; i++) {
    for (var j = 20; j < 60; j+=10) {
        str += ("[_" + num + "]" + "\r\n");
        str += "id=" + num + "\r\n";
        str += "bookId=" + i + "\r\n";
        str += "connectNum=" + j + "\r\n";
        str += "reward=" + "{'prop':[{'pId':860,'num':1}]}" + "\r\n";
        // str += "spId=" + (10 * i + j) + "\r\n";
        // str += "weight=100\r\n";
        // str += "convertDebris=5\r\n";
        // str += "exchangeDebris=20\r\n";
        // str += "flashProbability=4000\r\n";
        str += "\r\n\r\n";
        num++;
    }
}
fs.writeFileSync("./res.toml", str);
