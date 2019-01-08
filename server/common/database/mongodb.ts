import mongoose = require("mongoose");
import collections = require("./collections");
import Promise = require("bluebird");

export enum EMODELS {
  player = "player"
}

export class MongoClient {
  db: mongoose.Connection;

  models: {
    [modelName: string]: any;
  };

  constructor(host: string, dbname: string) {
    this.models = {};
    this.init(host, dbname);
  }

  /**
   * 初始化数据库实例
   * @param host
   * @param dbname
   */
  init(host: string, dbname: string) {
    const uri: string = `mongodb://yydpocket:eW9nVQgJxc@${host}:27017/${dbname}`;
    console.log(`uri:${uri}`);
    this.db = <mongoose.Connection>mongoose.createConnection(uri, {
      useNewUrlParser: true,
      promiseLibrary: Promise
    });
  }

  /**
   * 获取mongoose Model
   * @param modelName
   */
  getModel(modelName: string) {
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
