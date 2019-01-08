"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("underscore"));
const crypto = __importStar(require("crypto"));
class EncryptoTool {
    static base64_encode(str, encode = "utf8") {
        if (_.isEmpty(str)) {
            return "";
        }
        if (!_.isString(str)) {
            str = str.toString();
        }
        return Buffer.from(str, encode).toString("base64");
    }
    static base64_decode(str, encode = "base64") {
        if (_.isEmpty(str)) {
            return "";
        }
        return Buffer.from(str, encode).toString();
    }
    static aes_encode(data) {
        const algorithm = "aes-128-cbc";
        const key = "cl_love_awx_3344";
        const inputEncoding = "utf8";
        const outputEncoding = "base64";
        const cipher = crypto.createCipheriv(algorithm, key, "");
        cipher.setAutoPadding(true);
        const encodingStr = cipher.update(data, inputEncoding, outputEncoding);
        return encodingStr + cipher.final(outputEncoding);
    }
    static aes_decode(data) {
        const algorithm = "aes-128-cbc";
        const key = "cl_love_awx_3344";
        const inputEncoding = "base64";
        const outputEncoding = "utf8";
        const decipher = crypto.createDecipheriv(algorithm, key, "");
        decipher.setAutoPadding(true);
        const decodeStr = decipher.update(data, inputEncoding, outputEncoding);
        return decodeStr + decipher.final(outputEncoding);
    }
}
exports.EncryptoTool = EncryptoTool;
