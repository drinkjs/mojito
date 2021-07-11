import { FastifyInstance } from "fastify";
import fastifyMultipart from "fastify-multipart";
import fastifyStatic from "fastify-static";
import fastifyCookie from "fastify-cookie";
import fastifySession from "fastify-session";
import fastifyCsrf from "fastify-csrf";
import fastifyNextjs from "fastify-nextjs";
import { defaultStaticConfig, defaultConfig } from "../config";

export default async function plugin (server: FastifyInstance) {
  // 上传文件
  await server.register(fastifyMultipart);
  // 静态目录
  await server.register(fastifyStatic, {
    root: defaultStaticConfig.staticPath,
    prefix: defaultStaticConfig.staticPrefix,
  });

  await server.register(fastifyCookie);
  await server.register(fastifySession, {
    secret: defaultConfig.sessionSecret,
  });
  await server.register(fastifyCsrf, { sessionPlugin: "fastify-session" });
  server
    .register(fastifyNextjs, { dev: process.env.NODE_ENV !== "production" })
    .after(() => {
      server.next("/view");
    });
}
