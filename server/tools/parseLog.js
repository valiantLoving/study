"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const _ = __importStar(require("underscore"));
const logDir = "logs";
const files = fs.readdirSync(logDir);
const filterStrs = ["accumulative success"];
var lineNum = 0;
const dealLine = (line) => {
    if (!line || !_.isString(line)) {
        return;
    }
    for (let filter of filterStrs) {
        if (line.indexOf(filter) == -1) {
            return;
        }
    }
    lineNum++;
    const uid = line.match(/[0-9]+s[0-9]+p[0-9]+/)[0];
    const id = +(line.match(/ id:[0-9]+/)[0].substring(4));
    return { uid, id };
};
const dealFile = (file) => {
    const texts = fs.readFileSync(file).toString();
    const lines = texts.split('\n');
    const fileRes = {};
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineRes = dealLine(line);
        if (!lineRes) {
            continue;
        }
        if (!fileRes[lineRes.id]) {
            fileRes[lineRes.id] = [];
        }
        fileRes[lineRes.id].push(lineRes.uid);
    }
    return fileRes;
};
const readFiles = () => {
    const res = { "yyb": {}, "mix": {}, "iosbr": {} };
    for (var file of files) {
        var channel;
        if (file.indexOf('yyb') >= 0) {
            channel = "yyb";
        }
        else if (file.indexOf("mix") >= 0) {
            channel = "mix";
        }
        else if (file.indexOf("iosbr") >= 0) {
            channel = "iosbr";
        }
        else {
            continue;
        }
        const fileRes = dealFile(path.join(__dirname, logDir, file));
        for (let id in fileRes) {
            if (res[channel][id] == null) {
                res[channel][id] = 0;
            }
            res[channel][id] += fileRes[id].length;
        }
    }
    var allNum = 0;
    for (let channel in res) {
        const info = res[channel];
        for (let id in info) {
            allNum += info[id];
        }
    }
    console.log(`处理结果:${JSON.stringify(res)}, lineNum: ${lineNum},allNum:${allNum}`);
};
readFiles();
