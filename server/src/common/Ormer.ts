import { createConnection, ConnectionOptions } from "typeorm";
import { ORM_MODEL_METADATA } from "../core/decorator/ServiceDecorator";

export default class Ormer {
  static instance: Ormer;

  static getInstance () {
    if (!Ormer.instance) {
      Ormer.instance = new Ormer();
    }
    return Ormer.instance;
  }

  // connections: Map<string, Connection> = new Map();

  addConnect (options: ConnectionOptions) {
    createConnection(options)
      .then((connection) => {
        // 注入orm repository
        const services: any[] = Reflect.getMetadata(ORM_MODEL_METADATA, Ormer);
        if (services) {
          services.forEach(({ key, target, value, connectName }) => {
            if (target[key]) {
              return;
            }
            // 多数据库匹配
            if (options.name === connectName) {
              target[key] = connection.getRepository(value);
            }
          });
        }

        const connectOptions: any = options;
        const connectInfo = `${options.type}@${connectOptions?.host}:${connectOptions?.port}`;
        // this.connections.set(connName || connectInfo, connection);
        console.log(`${connectInfo} connected`.green);
      })
      .catch((err: any) => {
        console.error(err);
        setTimeout(() => {
          this.addConnect(options);
        }, 5000);
      });
  }
}
