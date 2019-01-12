"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var collections = require("./collections");
var Promise = require("bluebird");
var EMODELS;
(function (EMODELS) {
    EMODELS["player"] = "player";
})(EMODELS = exports.EMODELS || (exports.EMODELS = {}));
var MongoClient = (function () {
    function MongoClient(host, dbname) {
        this.models = {};
        this.init(host, dbname);
    }
    MongoClient.prototype.init = function (host, dbname) {
        var uri = "mongodb://yydpocket:eW9nVQgJxc@" + host + ":27017/" + dbname;
        console.log("uri:" + uri);
        this.db = mongoose.createConnection(uri, {
            useNewUrlParser: true,
            promiseLibrary: Promise
        });
    };
    MongoClient.prototype.getModel = function (modelName) {
        if (!EMODELS[modelName]) {
            console.log("\u672A\u5B9A\u4E49\u7684\u96C6\u5408: " + modelName);
            return;
        }
        if (!this.models[modelName]) {
            this.models[modelName] = collections.getModel(modelName, this.db);
        }
        return this.models[modelName];
    };
    return MongoClient;
}());
exports.MongoClient = MongoClient;
