"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const collections = require("./collections");
const Promise = require("bluebird");
var EMODELS;
(function (EMODELS) {
    EMODELS["player"] = "player";
})(EMODELS = exports.EMODELS || (exports.EMODELS = {}));
class MongoClient {
    constructor(host, dbname) {
        this.models = {};
        this.init(host, dbname);
    }
    init(host, dbname) {
        const uri = `mongodb://yydpocket:eW9nVQgJxc@${host}:27017/${dbname}`;
        console.log(`uri:${uri}`);
        this.db = mongoose.createConnection(uri, {
            useNewUrlParser: true,
            promiseLibrary: Promise
        });
    }
    getModel(modelName) {
        if (!EMODELS[modelName]) {
            console.log(`未定义的集合: ${modelName}`);
            return;
        }
        if (!this.models[modelName]) {
            this.models[modelName] = collections.getModel(modelName, this.db);
        }
        return this.models[modelName];
    }
}
exports.MongoClient = MongoClient;
