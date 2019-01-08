import { MongoClient } from "../common/database/mongodb";
import {
    IPlayer,
    IPlayerModel,
    IPlayerDocument
} from "../common/database/ModelsInterface";
import _ from "underscore";

const originUid: string = "2022s438p3806111";
const targetUid: string = "1s2p114";

const privateHost: string = "120.77.233.20";
const h5PrivateHost: string = "120.24.212.108";

const whiteHosts: string[] = [privateHost, h5PrivateHost, "localhost"];

const copyPlayer = async (): Promise<void> => {
    //   const originDB = new MongoClient("120.77.3.34", "pokeMers111");
    const originDB = new MongoClient("120.76.208.248", "poke438");
    const targetHost: string = h5PrivateHost;
    if(!_.contains(whiteHosts, targetHost)){
        throw Error(`只能向测试服务器copy数据,以免误操作!`);
    }
    const targetDB = new MongoClient(targetHost, "poke2");

    const originPlayerModel: IPlayerModel = originDB.getModel("player");
    const targetPlayerModel: IPlayerModel = targetDB.getModel("player");

    const originPlayer: IPlayerDocument = await originPlayerModel.loadByUserId(
        originUid,
        { _id: 0 }
    );
    if(!originPlayer){
        throw new Error(`源玩家 ${originUid}未找到`);
    }

    // 用原始账号数据更新目标账号数据
    await targetPlayerModel.updatePlayer(targetUid, originPlayer.toObject());
};

copyPlayer()
    .then(() => {
        console.log("copy player success");
    })
    .catch(e => {
        console.log(`copy player err:${JSON.stringify(e.stack)}`);
    })
    .then(() =>{
        process.exit();
    });
