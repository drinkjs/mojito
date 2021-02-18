// import * as dotenv from "dotenv";

// 加载环境变量
// dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });

export default {
  port: 3838,
  websocket: true, // 是否启用websocket
  cluster: false, // 是否启用多进程
  logger: false,
  staticPrefix: "/public/",
  staticPath: `${process.cwd()}/public`,
  libPath: `${process.cwd()}/public/libs`,
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
  //   database: 'screen_console',
  //   entities: [
  //     `${__dirname}/../entity/*.ts`,
  //   ],
  //   synchronize: false,
  // },
};
