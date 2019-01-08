import mongoose = require("mongoose");
import * as playerModel from './player';

// export const player = playerModel.getModel;

export const getModel = (modelName: string, db: mongoose.Connection) =>{
    switch(modelName){
        case "player":
            return  playerModel.getModel(db);
    }
}


