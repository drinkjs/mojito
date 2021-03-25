import { FastifyInstance } from "fastify";
import fastifyMultipart from "fastify-multipart";
import fastifyStatic from "fastify-static";
import fastifyCookie from "fastify-cookie";
import fastifySession from "fastify-session";
import fastifyCsrf from "fastify-csrf";
import config from "../config";

export default async function plugin (server: FastifyInstance) {
  // 上传文件
  await server.register(fastifyMultipart);
  // 静态目录
  await server.register(fastifyStatic, {
    root: config.staticPath,
    prefix: config.staticPrefix,
  });

  await server.register(fastifyCookie);
  await server.register(fastifySession, { secret: config.sessionSecret });
  await server.register(fastifyCsrf, { sessionPlugin: "fastify-session" });
}
