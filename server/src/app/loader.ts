import { FastifyInstance } from "fastify";
import Router from "../core/Router";
import { defaultConfig } from "../config";
import Mongoer from "../common/Mongoer";
import Ormer from "../common/Ormer";
import GlobalExceptionFilter from "../filter/GlobalExceptionFilter";
import plugin from "../plugin";

export default async function loader (fastify: FastifyInstance) {
  await plugin(fastify);
  const router = Router.getInstance(fastify, defaultConfig.websocket);
  router.useExceptionFilter(new GlobalExceptionFilter());

  if (defaultConfig.mongo) {
    Mongoer.getInstance(defaultConfig.mongo.uris, defaultConfig.mongo.options);
  }
  if (defaultConfig.orm) {
    Ormer.getInstance().addConnect(defaultConfig.orm);
  }
}
