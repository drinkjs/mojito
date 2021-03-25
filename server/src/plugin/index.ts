import { FastifyInstance } from "fastify";
import fastifyMultipart from "fastify-multipart";
import fastifyStatic from "fastify-static";
import fastifyCookie from "fastify-cookie";
import fastifyCsrf from "fastify-csrf";
import config from "../config";

export default function plugin (server: FastifyInstance) {
  // 上传文件
  server.register(fastifyMultipart);
  // 静态目录
  server.register(fastifyStatic, {
    root: config.staticPath,
    prefix: config.staticPrefix,
  });

  server.register(fastifyCookie);
  server.register(fastifyCsrf, { cookieOpts: { signed: false } });
  // server.addHook('onRequest', server.csrfProtection)
}
