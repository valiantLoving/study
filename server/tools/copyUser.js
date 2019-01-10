"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("../common/database/mongodb");
const underscore_1 = __importDefault(require("underscore"));
const originUid = "62s190p1622507";
const targetUid = "1s2p409";
const privateHost = "120.77.233.20";
const h5PrivateHost = "120.24.212.108";
const playerPrivateHost = "120.78.193.157";
const whiteHosts = [privateHost, h5PrivateHost, playerPrivateHost, "localhost"];
const copyPlayer = () => __awaiter(this, void 0, void 0, function* () {
    const originDB = new mongodb_1.MongoClient("120.76.234.246", "pokeMers181");
    const targetHost = playerPrivateHost;
    if (!underscore_1.default.contains(whiteHosts, targetHost)) {
        throw Error(`只能向测试服务器copy数据,以免误操作!`);
    }
    const targetDB = new mongodb_1.MongoClient(targetHost, "poke2");
    const originPlayerModel = originDB.getModel("player");
    const targetPlayerModel = targetDB.getModel("player");
    const originPlayer = yield originPlayerModel.loadByUserId(originUid, { _id: 0 });
    if (!originPlayer) {
        throw new Error(`源玩家 ${originUid}未找到`);
    }
    yield targetPlayerModel.updatePlayer(targetUid, originPlayer.toObject());
});
copyPlayer()
    .then(() => {
    console.log("copy player success");
})
    .catch(e => {
    console.log(`copy player err:${JSON.stringify(e.stack)}`);
})
    .then(() => {
    process.exit();
});
