
import * as fs from "fs";
import * as path from "path";
import * as _ from "underscore";

const logDir: string = "logs";

const files = fs.readdirSync(logDir);
// console.log('filses', files);
/**用于过滤的字符串 */
const filterStrs: string[] = ["accumulative success"];

var lineNum: number = 0;
const dealLine = (line: string) =>{
    if(!line || !_.isString(line)){
        return;
    }
    for(let filter of filterStrs){
        if(line.indexOf(filter) == -1){
            return;
        }
    }
    lineNum++;
    const uid: string = line.match(/[0-9]+s[0-9]+p[0-9]+/)[0];
    const id: number = +(line.match(/ id:[0-9]+/)[0].substring(4));
    // console.log(`uid:${uid}, id:${id}`);
    return {uid, id};
}

const dealFile = (file: string)=>{
    const texts: string = fs.readFileSync(file).toString();
    const lines: string[] = texts.split('\n');
    const fileRes = {};
    for(let i = 0; i < lines.length; i++){
        const line: string = lines[i];
        const lineRes = dealLine(line);
        if(!lineRes){
            continue;
        }
        if (!fileRes[lineRes.id]){
            fileRes[lineRes.id] = [];
        }
        fileRes[lineRes.id].push(lineRes.uid);
    }
    return fileRes;
}

const readFiles = () =>{
    const res = {"yyb": {}, "mix": {}, "iosbr": {}};
    for (var file of files) {
        var channel: string;
        if (file.indexOf('yyb') >= 0) {
            channel = "yyb";
        } else if (file.indexOf("mix") >= 0) {
            channel = "mix";
        }else if(file.indexOf("iosbr") >= 0){
            channel = "iosbr";
        }else{
            continue;
        }
        const fileRes = dealFile(path.join(__dirname, logDir, file));
        for(let id in fileRes){
            if(res[channel][id] == null){
                res[channel][id] = 0;
            }
            res[channel][id] += fileRes[id].length;
        }
    }
    var allNum: number = 0;
    for(let channel in res){
        const info = res[channel];
        for(let id in info){
            allNum+= info[id];
        }
    }

    console.log(`处理结果:${JSON.stringify(res)}, lineNum: ${lineNum},allNum:${allNum}`);
};

readFiles();