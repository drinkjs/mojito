export default {
  port: 3838,
  websocket: true, // 是否启用websocket
  cluster: false, // 是否启用多进程，启用后websocket消息需要通过发布/订阅的方式处理
  logger: false,
  staticPrefix: "/public/",
  staticPath: `${process.cwd()}/public`, // 所有静态文件存放访目录，用户上传的图片也存在这，生产环境建议放在cdn或nginx下
  libPath: `${process.cwd()}/public/libs`, // 组件上传后存放的目录，生产环境建议放在cdn或nginx下
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
