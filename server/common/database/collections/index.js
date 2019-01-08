"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const playerModel = __importStar(require("./player"));
exports.getModel = (modelName, db) => {
    switch (modelName) {
        case "player":
            return playerModel.getModel(db);
    }
};
