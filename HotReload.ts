
import fs = require("fs");
import * as path from "path";
import Bluebird = require("bluebird");
import _ = require("underscore");
const readdirAsync = Bluebird.promisify(fs.readdir);
const statAsync = Bluebird.promisify(fs.stat);

/**
 * 热更新模块
 */
export class HotReload {
    /**保留的文件类型 */
    private extnames: string[];
    /**需要忽略的文件夹 */
    private ignoreDirList: string[];
    /**项目中所有js文件 */
    private allJsFiles: string[];
    /**
     * 包含项目中所有js文件的包含映射关系
     * key对应某个js文件的绝对路径，value对应该文件中require的所有js文件绝对路径
     */
    private includeRelateMap: { [path: string]: string };

    constructor() {
        this.extnames = ['.js', '.jsx'];
        /*初始化忽略文件夹列表 */
        this.ignoreDirList = ['node_modules', 'test', '.git'];

        this.allJsFiles = [];
        this.includeRelateMap = {};
    }

    /**
     * 获取给定目录下的所有js文件(包括jsx)
     * @param fpath 
     */
    async getAllJsFiles(fpath: string): Bluebird<void> {
        const files = <string[]>await readdirAsync(fpath);
        await Bluebird.each(files, async file => {
            const filePath: string = path.join(fpath, file);
            const stat = await statAsync(filePath);
            if (stat.isDirectory()) {
                if (!_.contains(this.ignoreDirList, file)) {
                    return this.getAllJsFiles(filePath);
                }
            } else {
                const extname: string = path.extname(file);
                if (_.contains(this.extnames, extname)) {
                    // 文件绝对路径  
                    const absolutePath: string = require.resolve('./' + path.posix.normalize(filePath));
                    console.log(`absolutePath:`, absolutePath);
                    this.allJsFiles.push(absolutePath);
                }
            }
        });
    }

    /**
     * 分析某个js文件的包含映射关系
     * @param filePath 
     */
    private analysisIncludeRelate(filePath: string){
        const extname: string = path.extname(filePath);
        const option: string = extname == '.js' ? "utf8" : "binary";
        let content: string = fs.readFileSync(filePath, option);
        // if(){

        // }
    }

}

// (new HotReload()).getAllJsFiles("./server").then(result => {
//     console.log(`result:${JSON.stringify(result)}`)
// })
