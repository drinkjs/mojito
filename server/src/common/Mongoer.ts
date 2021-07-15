import { getModelForClass } from "@typegoose/typegoose";
// import { registerDecorator, ValidationOptions } from "class-validator";
import mongoose, { Connection } from "mongoose";
import { MG_MODEL_METADATA } from "../core/decorator/ServiceDecorator";
import { defaultConfig } from "../config";
export interface MongoConnectionOptions {
  uris: string;
  options: mongoose.ConnectionOptions;
}

export default class Mongoer {
  static instance: Mongoer;

  static getInstance () {
    if (!Mongoer.instance) {
      Mongoer.instance = new Mongoer();
    }
    return Mongoer.instance;
  }

  static getCurrInstance () {
    return Mongoer.instance;
  }

  private connections: Map<string, Connection> = new Map();

  async addConnect (opts: MongoConnectionOptions) {
    const conn = await mongoose
      .createConnection(opts.uris, opts.options)
      .catch((err) => {
        throw err;
      });
    if (conn) {
      this.connections.set(opts.uris, conn);
      console.log(`${opts.uris} connected`.green);
    }
    return conn;
  }

  async inject () {
    // 注入mongoose Model
    const services: any[] = Reflect.getMetadata(MG_MODEL_METADATA, Mongoer);
    if (services) {
      for (const service of services) {
        const { key, target, model, options } = service;
        if (target[key]) {
          return;
        }
        const opts: MongoConnectionOptions = options || defaultConfig.mongo;
        const conn = this.connections.has(opts.uris)
          ? this.connections.get(opts.uris)
          : await this.addConnect(opts);
        target[key] = getModelForClass(model, {
          existingConnection: conn || undefined,
        });
      }
    }
  }
}

/**
 * 自定义验证objectId装饰器
 * @param property
 * @param validationOptions
 */
// export function IsObjectId (validationOptions?: ValidationOptions) {
//   return function (object: Object, propertyName: string) {
//     registerDecorator({
//       target: object.constructor,
//       propertyName,
//       options: validationOptions,
//       constraints: [],
//       validator: {
//         validate (value: any) {
//           return mongoose.Types.ObjectId.isValid(value);
//         },
//       },
//     });
//   };
// }
