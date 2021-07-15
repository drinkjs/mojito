import {
  createConnection,
  ConnectionOptions,
  getConnectionManager,
} from "typeorm";
import { ORM_MODEL_METADATA } from "../core/decorator/ServiceDecorator";
import { defaultConfig } from "../config";

export default class Ormer {
  static instance: Ormer;

  static getInstance () {
    if (!Ormer.instance) {
      Ormer.instance = new Ormer();
    }
    return Ormer.instance;
  }

  async addConnect (options: ConnectionOptions) {
    const conn = await createConnection(options).catch((err) => {
      throw err;
    });
    if (conn) {
      const connectOptions: any = options;
      const connectInfo = `${options.type}@${connectOptions?.host}:${connectOptions?.port}`;
      console.log(`${connectInfo} connected`.green);
    }
    return conn;
  }

  async inject () {
    // 注入orm repository
    const services: any[] = Reflect.getMetadata(ORM_MODEL_METADATA, Ormer);
    if (services) {
      for (const service of services) {
        const { key, target, entity, options } = service;
        if (target[key]) {
          return;
        }
        const opts = options || defaultConfig.orm;
        if (!opts.name) {
          opts.name = "default";
        }
        const connection = getConnectionManager().has(opts.name)
          ? getConnectionManager().get(opts.name)
          : await this.addConnect(opts);
        if (connection) {
          target[key] = connection.getRepository(entity);
        }
      }
    }
  }
}
