import { Document, Model } from 'mongoose';
import Promise = require("bluebird");

export interface IPlayer {
  userId: string;
  playerData: {
    userId: string,
    _playerInfo: {
        userId: string,
    },
    _message: {},
    _friendSys: {},
    _playerGuild: {},
  };
}
export interface IPlayerDocument extends IPlayer, Document {
  // declare any instance methods here
}
export interface IPlayerModel extends  Model<IPlayerDocument>{
    // declare any static methods here
    loadByUserId(userId: string, options?:any): Promise<IPlayerDocument>;
    updatePlayer(targetUid: string, originInfo: IPlayerDocument): Promise<void>;
}