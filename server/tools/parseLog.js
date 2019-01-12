"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var _ = __importStar(require("underscore"));
var logDir = "logs";
var files = fs.readdirSync(logDir);
var filterStrs = ["accumulative success"];
var lineNum = 0;
var dealLine = function (line) {
    if (!line || !_.isString(line)) {
        return;
    }
    for (var _i = 0, filterStrs_1 = filterStrs; _i < filterStrs_1.length; _i++) {
        var filter = filterStrs_1[_i];
        if (line.indexOf(filter) == -1) {
            return;
        }
    }
    lineNum++;
    var uid = line.match(/[0-9]+s[0-9]+p[0-9]+/)[0];
    var id = +(line.match(/ id:[0-9]+/)[0].substring(4));
    return { uid: uid, id: id };
};
var dealFile = function (file) {
    var texts = fs.readFileSync(file).toString();
    var lines = texts.split('\n');
    var fileRes = {};
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var lineRes = dealLine(line);
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
var readFiles = function () {
    var res = { "yyb": {}, "mix": {}, "iosbr": {} };
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
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
        var fileRes = dealFile(path.join(__dirname, logDir, file));
        for (var id in fileRes) {
            if (res[channel][id] == null) {
                res[channel][id] = 0;
            }
            res[channel][id] += fileRes[id].length;
        }
    }
    var allNum = 0;
    for (var channel_1 in res) {
        var info = res[channel_1];
        for (var id in info) {
            allNum += info[id];
        }
    }
    console.log("\u5904\u7406\u7ED3\u679C:" + JSON.stringify(res) + ", lineNum: " + lineNum + ",allNum:" + allNum);
};
readFiles();
