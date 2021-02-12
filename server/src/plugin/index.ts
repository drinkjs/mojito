import { FastifyInstance } from "fastify";
import fastifyMultipart from "fastify-multipart";
import fastifyStatic from "fastify-static";
import config from "../config";

export default function plugin (server: FastifyInstance) {
  // 上传文件
  server.register(fastifyMultipart);
  // 静态目录
  server.register(fastifyStatic, {
    root: config.staticPath,
    prefix: "/static/",
  });
}
