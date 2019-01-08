import * as _ from "underscore";
import * as crypto from "crypto";
import * as utf8 from "utf8";

export class EncryptoTool {
    /**
     * base64加密
     * @param str
     * @param encode
     */
    static base64_encode(str: any, encode: string = "utf8"): string {
        if (_.isEmpty(str)) {
            return "";
        }
        if (!_.isString(str)) {
            str = str.toString();
        }
        return Buffer.from(str, encode).toString("base64");
    }

    /**
     * base64 解密
     * @param str
     * @param encode
     */
    static base64_decode(str: string, encode: string = "base64"): string {
        if (_.isEmpty(str)) {
            return "";
        }
        return Buffer.from(str, encode).toString();
    }

    /**
     * aes 加密
     * @param data
     */
    static aes_encode(data: string): string {
        // 算法
        const algorithm: string = "aes-128-cbc";
        //加密key
        const key: string = "cl_love_awx_3344";
        // 输入的数据编码
        const inputEncoding: crypto.Utf8AsciiBinaryEncoding = "utf8";
        // 输出的数据编码
        const outputEncoding: crypto.HexBase64BinaryEncoding = "base64";

        const cipher = crypto.createCipheriv(algorithm, key, "");
        cipher.setAutoPadding(true);
        // 更新密码
        const encodingStr = cipher.update(data, inputEncoding, outputEncoding);
        // 返回加密内容
        return encodingStr + cipher.final(outputEncoding);
    }

    /**
     * aes 解密
     * @param data
     */
    static aes_decode(data: string): string {
        // 算法
        const algorithm: string = "aes-128-cbc";
        //加密key
        const key: string = "cl_love_awx_3344";
        // 输入的数据编码
        const inputEncoding: crypto.HexBase64BinaryEncoding = "base64";
        // 输出的数据编码
        const outputEncoding: crypto.Utf8AsciiBinaryEncoding = "utf8";

        const decipher = crypto.createDecipheriv(algorithm, key, "");
        decipher.setAutoPadding(true);
        
        // 使用新数据更新解密
        const decodeStr = decipher.update(data, inputEncoding, outputEncoding);
        // 返回加密内容
        return decodeStr + decipher.final(outputEncoding);
    }
}
