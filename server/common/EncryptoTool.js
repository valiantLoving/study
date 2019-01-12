"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __importStar(require("underscore"));
var crypto = __importStar(require("crypto"));
var EncryptoTool = (function () {
    function EncryptoTool() {
    }
    EncryptoTool.base64_encode = function (str, encode) {
        if (encode === void 0) { encode = "utf8"; }
        if (_.isEmpty(str)) {
            return "";
        }
        if (!_.isString(str)) {
            str = str.toString();
        }
        return Buffer.from(str, encode).toString("base64");
    };
    EncryptoTool.base64_decode = function (str, encode) {
        if (encode === void 0) { encode = "base64"; }
        if (_.isEmpty(str)) {
            return "";
        }
        return Buffer.from(str, encode).toString();
    };
    EncryptoTool.aes_encode = function (data) {
        var algorithm = "aes-128-cbc";
        var key = "cl_love_awx_3344";
        var inputEncoding = "utf8";
        var outputEncoding = "base64";
        var cipher = crypto.createCipheriv(algorithm, key, "");
        cipher.setAutoPadding(true);
        var encodingStr = cipher.update(data, inputEncoding, outputEncoding);
        return encodingStr + cipher.final(outputEncoding);
    };
    EncryptoTool.aes_decode = function (data) {
        var algorithm = "aes-128-cbc";
        var key = "cl_love_awx_3344";
        var inputEncoding = "base64";
        var outputEncoding = "utf8";
        var decipher = crypto.createDecipheriv(algorithm, key, "");
        decipher.setAutoPadding(true);
        var decodeStr = decipher.update(data, inputEncoding, outputEncoding);
        return decodeStr + decipher.final(outputEncoding);
    };
    return EncryptoTool;
}());
exports.EncryptoTool = EncryptoTool;
