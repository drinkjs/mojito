import { FastifyInstance } from "fastify";
import Router from "../core/Router";
import { defaultConfig } from "../config";
import Mongoer from "../common/Mongoer";
import Ormer from "../common/Ormer";
import plugin from "../plugin";
import hooks from "../hooks";

export default async function loader (fastify: FastifyInstance) {
  await plugin(fastify);
  await hooks(fastify);
  Router.getInstance(fastify, defaultConfig.websocket);

  if (defaultConfig.mongo) {
    Mongoer.getInstance(defaultConfig.mongo.uris, defaultConfig.mongo.options);
  }
  if (defaultConfig.orm) {
    Ormer.getInstance().addConnect(defaultConfig.orm);
  }
}
