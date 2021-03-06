"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = __importStar(require("path"));
var Bluebird = require("bluebird");
var _ = require("underscore");
var readdirAsync = Bluebird.promisify(fs.readdir);
var statAsync = Bluebird.promisify(fs.stat);
var HotReload = (function () {
    function HotReload() {
        this.extnames = ['.js', '.jsx'];
        this.ignoreDirList = ['node_modules', 'test', '.git'];
        this.allJsFiles = [];
        this.includeRelateMap = {};
    }
    HotReload.prototype.getAllJsFiles = function (fpath) {
        return __awaiter(this, void 0, Bluebird, function () {
            var files;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, readdirAsync(fpath)];
                    case 1:
                        files = _a.sent();
                        return [4, Bluebird.each(files, function (file) { return __awaiter(_this, void 0, void 0, function () {
                                var filePath, stat, extname, absolutePath;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            filePath = path.join(fpath, file);
                                            return [4, statAsync(filePath)];
                                        case 1:
                                            stat = _a.sent();
                                            if (stat.isDirectory()) {
                                                if (!_.contains(this.ignoreDirList, file)) {
                                                    return [2, this.getAllJsFiles(filePath)];
                                                }
                                            }
                                            else {
                                                extname = path.extname(file);
                                                if (_.contains(this.extnames, extname)) {
                                                    absolutePath = require.resolve('./' + path.posix.normalize(filePath));
                                                    console.log("absolutePath:", absolutePath);
                                                    this.allJsFiles.push(absolutePath);
                                                }
                                            }
                                            return [2];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    HotReload.prototype.analysisIncludeRelate = function (filePath) {
        var extname = path.extname(filePath);
        var option = extname == '.js' ? "utf8" : "binary";
        var content = fs.readFileSync(filePath, option);
    };
    return HotReload;
}());
exports.HotReload = HotReload;
