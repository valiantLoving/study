import { Schema, Connection } from "mongoose";
import { IPlayerDocument, IPlayerModel, IPlayer } from "../ModelsInterface";
import * as _ from "underscore";

var PlayerSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    playerData: {
        // userId: String,
        // _playerInfo: {
        //     userId: String,
        // },
        // _message: {},
        // _friendSys: {},
        // _playerGuild: {},
    }
});

PlayerSchema.statics.loadByUserId = async function(
    userId: string,
    options = {}
) {
    const self: IPlayerModel = this;
    return await self.findOne({ userId: userId }, options);
};

PlayerSchema.statics.updatePlayer = async function(
    targetUid: string,
    originInfo: IPlayer
) {
    var targetPlayer: IPlayerDocument = await this.loadByUserId(targetUid);

    if(!targetPlayer){
        throw Error(`目标账号 ${targetUid}不存在`);
    }

    // 修改三个地方的uid
    originInfo.userId = targetUid;
    originInfo.playerData.userId = targetUid;
    originInfo.playerData._playerInfo.userId = targetUid;

    // 删除公会_playerGuild
    delete originInfo.playerData._playerGuild;

    // _friendSys里面的数组清空，不能整个字段删除
    for (let key in originInfo.playerData._friendSys) {
        if (_.isArray(originInfo.playerData._friendSys[key])) {
            originInfo.playerData._friendSys[key] = [];
        }
    }

    // 删除聊天消息_message
    originInfo.playerData._message = {};

    // 复制数据
    targetPlayer.playerData = originInfo.playerData;

    await targetPlayer.save();
};

/**
 * 获取model
 * @param db 数据库连接实例 
 */
export const getModel = (db: Connection): IPlayerModel => {
    const PlayerModel = db.model("player", PlayerSchema, "player");
    return PlayerModel as IPlayerModel;
};
