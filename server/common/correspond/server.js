"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
const server = net.createServer((socket) => {
    socket.end('goodbye\n');
}).on('error', (err) => {
    throw err;
});
server.listen(() => {
    console.log('opened server on', server.address());
});
