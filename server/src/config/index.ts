import * as dotenv from "dotenv";
import { NgulfOptions } from "ngulf";
import controllers from "../controller";

dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });

const staticPath = process.env.STATIC_PATH || `${process.cwd()}/public`;
console.info(staticPath.bgBlue);

export interface IConfig extends NgulfOptions {
  readonly sessionSecret: string;
  readonly port: number;
  readonly staticPrefix: string;
  readonly staticPath: string;
  readonly libPath: string;
}

const defaultConfig: IConfig = {
  port: 3838,
  sessionSecret: "a secret with minimum length of 32 characters", // 一个32位的随机字符串，务必修改
  websocket: true, // 是否启用websocket
  logger: false,
  staticPrefix: "/public/",
  staticPath, // 所有静态文件存放访目录，用户上传的图片也存在这，生产环境建议放在cdn或nginx下
  libPath: process.env.LIBS_PATH || `${staticPath}/libs`, // 组件上传后存放的目录，生产环境建议放在cdn或nginx下
  controllers,
  mongo: {
    // see https://mongoosejs.com/
    uris: "mongodb://localhost:27017/",
    options: {
      dbName: "mojito",
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      autoIndex: false,
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
      // useFindAndModify: false,
    },
  },
};

export default defaultConfig;
