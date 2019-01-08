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
const mongoose_1 = require("mongoose");
const _ = __importStar(require("underscore"));
var PlayerSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    playerData: {}
});
PlayerSchema.statics.loadByUserId = function (userId, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const self = this;
        return yield self.findOne({ userId: userId }, options);
    });
};
PlayerSchema.statics.updatePlayer = function (targetUid, originInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        var targetPlayer = yield this.loadByUserId(targetUid);
        if (!targetPlayer) {
            throw Error(`目标账号 ${targetUid}不存在`);
        }
        originInfo.userId = targetUid;
        originInfo.playerData.userId = targetUid;
        originInfo.playerData._playerInfo.userId = targetUid;
        delete originInfo.playerData._playerGuild;
        for (let key in originInfo.playerData._friendSys) {
            if (_.isArray(originInfo.playerData._friendSys[key])) {
                originInfo.playerData._friendSys[key] = [];
            }
        }
        originInfo.playerData._message = {};
        targetPlayer.playerData = originInfo.playerData;
        yield targetPlayer.save();
    });
};
exports.getModel = (db) => {
    const PlayerModel = db.model("player", PlayerSchema, "player");
    return PlayerModel;
};
