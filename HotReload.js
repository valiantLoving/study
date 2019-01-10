"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = __importStar(require("path"));
const Promise = require("bluebird");
const _ = require("underscore");
const readdirAsync = Promise.promisify(fs.readdir);
const statAsync = Promise.promisify(fs.stat);
class HotReload {
    constructor() {
        this.extnames = ['.js', '.jsx'];
        this.ignoreDirList = ['node_modules', 'test', '.git'];
        this.allJsFiles = [];
        this.includeRelateMap = {};
    }
    getAllJsFiles(fpath) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield readdirAsync(fpath);
            yield Promise.each(files, (file) => __awaiter(this, void 0, void 0, function* () {
                const filePath = path.join(fpath, file);
                const stat = yield statAsync(filePath);
                if (stat.isDirectory()) {
                    if (!_.contains(this.ignoreDirList, file)) {
                        return this.getAllJsFiles(filePath);
                    }
                }
                else {
                    const extname = path.extname(file);
                    if (_.contains(this.extnames, extname)) {
                        const absolutePath = require.resolve('./' + path.posix.normalize(filePath));
                        console.log(`absolutePath:`, absolutePath);
                        this.allJsFiles.push(absolutePath);
                    }
                }
            }));
        });
    }
}
exports.HotReload = HotReload;
(new HotReload()).getAllJsFiles("./server").then(result => {
    console.log(`result:${JSON.stringify(result)}`);
});
