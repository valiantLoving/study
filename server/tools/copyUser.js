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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("../common/database/mongodb");
var underscore_1 = __importDefault(require("underscore"));
var originUid = "62s190p1622507";
var targetUid = "1s2p409";
var privateHost = "120.77.233.20";
var h5PrivateHost = "120.24.212.108";
var playerPrivateHost = "120.78.193.157";
var whiteHosts = [privateHost, h5PrivateHost, playerPrivateHost, "localhost"];
var copyPlayer = function () { return __awaiter(_this, void 0, void 0, function () {
    var originDB, targetHost, targetDB, originPlayerModel, targetPlayerModel, originPlayer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                originDB = new mongodb_1.MongoClient("120.76.234.246", "pokeMers181");
                targetHost = playerPrivateHost;
                if (!underscore_1.default.contains(whiteHosts, targetHost)) {
                    throw Error("\u53EA\u80FD\u5411\u6D4B\u8BD5\u670D\u52A1\u5668copy\u6570\u636E,\u4EE5\u514D\u8BEF\u64CD\u4F5C!");
                }
                targetDB = new mongodb_1.MongoClient(targetHost, "poke2");
                originPlayerModel = originDB.getModel("player");
                targetPlayerModel = targetDB.getModel("player");
                return [4, originPlayerModel.loadByUserId(originUid, { _id: 0 })];
            case 1:
                originPlayer = _a.sent();
                if (!originPlayer) {
                    throw new Error("\u6E90\u73A9\u5BB6 " + originUid + "\u672A\u627E\u5230");
                }
                return [4, targetPlayerModel.updatePlayer(targetUid, originPlayer.toObject())];
            case 2:
                _a.sent();
                return [2];
        }
    });
}); };
copyPlayer()
    .then(function () {
    console.log("copy player success");
})
    .catch(function (e) {
    console.log("copy player err:" + JSON.stringify(e.stack));
})
    .then(function () {
    process.exit();
});
