import * as dotenv from "dotenv";
import { MongoConnectionOptions } from "src/common/Mongoer";
import { ConnectionOptions } from "typeorm";

dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });

const staticPath = process.env.STATIC_PATH || `${process.cwd()}/public`;
console.info(staticPath.bgBlue);

export interface IConfig {
  readonly port: number;
  readonly websocket?: boolean;
  readonly cluster?: boolean;
  readonly logger?: boolean;
  readonly sessionSecret: string;
  readonly mongo?: MongoConnectionOptions;
  readonly orm?: ConnectionOptions;
}

export interface IStaticConfig {
  readonly staticPrefix: string;
  readonly staticPath: string;
  readonly libPath: string;
}

export const defaultStaticConfig: IStaticConfig = {
  staticPrefix: "/public/",
  staticPath, // 所有静态文件存放访目录，用户上传的图片也存在这，生产环境建议放在cdn或nginx下
  libPath: process.env.LIBS_PATH || `${staticPath}/libs`, // 组件上传后存放的目录，生产环境建议放在cdn或nginx下
};

export const defaultConfig: IConfig = {
  port: 3838,
  websocket: true,
  cluster: false,
  logger: false,
  sessionSecret: "a secret with minimum length of 32 characters",
  mongo: {
    uris: "mongodb://localhost:27017/",
    options: {
      dbName: "mojito",
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: false,
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
      useFindAndModify: false,
    },
  },
  // orm: {
  //   type: 'mysql',
  //   host: 'localhost',
  //   port: 3306,
  //   username: 'root',
  //   password: '',
  //   database: 'test',
  //   entities: [
  //     `${__dirname}/../entity/*.ts`,
  //   ],
  //   synchronize: false,
  // }
};
