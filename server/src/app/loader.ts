import { FastifyInstance } from "fastify";
import Router from "../core/Router";
import config from "../config";
import Mongoer from "../common/Mongoer";
import Ormer from "../common/Ormer";
import GlobalExceptionFilter from "../filter/GlobalExceptionFilter";
import plugin from "../plugin";

export default async function loader (fastify: FastifyInstance) {
  const configData = config as any;
  await plugin(fastify);
  const router = Router.getInstance(fastify, configData.websocket);
  router.useExceptionFilter(new GlobalExceptionFilter());

  if (configData.mongo) {
    Mongoer.getInstance(config.mongo.uri, config.mongo.options);
  }
  if (configData.orm) {
    Ormer.getInstance().addConnect(configData.orm);
  }
}
