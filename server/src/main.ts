import * as cluster from "cluster";
import { launch } from "./app";
import { defaultConfig } from "./config";

if (cluster.isMaster && defaultConfig.cluster) {
  // 创建子进程
  // eslint-disable-next-line global-require
  const numCPUs = require("os").cpus().length; // 获取CPU的个数
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  // 子进程发来的消息
  // cluster.on('message', (worker, message) => {});

  // 监测子进程退出
  cluster.on("exit", (/* worker */) => {
    // logger.log(new Error('Worker ' + worker.process.pid + ' died'));
  });
} else {
  launch();
}
