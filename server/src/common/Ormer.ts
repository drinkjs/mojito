import { createConnection, ConnectionOptions } from "typeorm";
import { ORM_MODEL_METADATA } from "../core/decorator/ServiceDecorator";

export type OrmConnectionOpations = {
  name?: string;
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  entities: string[];
  synchronize: boolean;
};

export default class Ormer {
  static instance: Ormer;

  static getInstance () {
    if (!Ormer.instance) {
      Ormer.instance = new Ormer();
    }
    return Ormer.instance;
  }

  // connections: Map<string, Connection> = new Map();

  addConnect (options: OrmConnectionOpations) {
    const connName = options.name;
    createConnection(options as ConnectionOptions)
      .then((connection) => {
        // 注入orm repository
        const services: any[] = Reflect.getMetadata(ORM_MODEL_METADATA, Ormer);
        if (services) {
          services.forEach(({ key, target, value, connectName }) => {
            if (target[key]) {
              return;
            }
            // 多数据库匹配
            if (connName === connectName) {
              target[key] = connection.getRepository(value);
            }
          });
        }
        const connectInfo = `${options.type}@${options.host}:${options.port}`;
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
