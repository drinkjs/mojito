import * as dotenv from "dotenv";

dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });

const staticPath = process.env.STATIC_PATH || `${process.cwd()}/public`;
console.info(staticPath.bgBlue);

export default {
  port: 3838,
  sessionSecret: "a secret with minimum length of 32 characters", // 一个32位的随机字符串，务必修改
  websocket: true, // 是否启用websocket
  cluster: false, // 是否启用多进程，启用后websocket消息需要通过发布/订阅的方式处理
  logger: {
    level: "error", // seet https://www.fastify.io/docs/latest/Logging/
  },
  staticPrefix: "/public/",
  staticPath, // 所有静态文件存放访目录，用户上传的图片也存在这，生产环境建议放在cdn或nginx下
  libPath: process.env.LIBS_PATH || `${staticPath}/libs`, // 组件上传后存放的目录，生产环境建议放在cdn或nginx下
  mongo: {
    // see https://mongoosejs.com/
    uri: "mongodb://localhost:27017/",
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
  //   // see https://github.com/typeorm/typeorm
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
  // },
};

// 默认组件类型，type表没数据时返回
export const DefaultComponentTypes = [
  {
    id: "5ff51e221e55c532f07fa880",
    name: "图表",
    icon: "icon-tubiaozhuzhuangtu",
  },
  {
    id: "5ff5217fbd5fc91e3c7bc672",
    name: "文本",
    icon: "icon-wenzi",
  },
  {
    id: "5ff521b7ae405915d45996d0",
    name: "多媒体",
    icon: "icon-tupian",
  },
  {
    id: "5ff5221322b3f34f680e41c2",
    name: "自定义",
    icon: "icon-zidingyi",
  },
  {
    id: "5ff522ccd1ccf52bccbec2ad",
    name: "折线图",
    icon: "icon-zhexiantu",
    pid: "5ff51e221e55c532f07fa880",
  },
  {
    id: "5ff52309ca47cc1cd8933560",
    name: "柱状图",
    icon: "icon-tubiaobeifen5",
    pid: "5ff51e221e55c532f07fa880",
  },
  {
    id: "5ff52325f5e8fa0e44729958",
    name: "饼图",
    icon: "icon-bingtu",
    pid: "5ff51e221e55c532f07fa880",
  },
  {
    id: "5ff5255008c04b0e48293f2a",
    name: "仪表盘",
    icon: "icon-yibiaopan",
    pid: "5ff51e221e55c532f07fa880",
  },
];
