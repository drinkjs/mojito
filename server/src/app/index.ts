/* eslint-disable no-unused-vars */
import "reflect-metadata";
import "colors";
import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { defaultConfig } from "../config";
import loader from "./loader";

export const server: FastifyInstance = Fastify({
  logger: defaultConfig.logger,
  pluginTimeout: 60 * 1000,
});

export async function launch () {
  try {
    await loader(server);
    await server.listen(defaultConfig.port);
    console.info(`server listening on ${defaultConfig.port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

declare global {
  interface RouterContext {
    req: FastifyRequest;
    res: FastifyReply;
  }
  interface IResult<T> {
    code: number;
    msg?: string;
    data?: T;
    current?: number;
    pageSize?: number;
    total?: number;
  }
  type PromiseRes<T> = Promise<IResult<T>>;
  interface ExceptionFilter {
    catch: (error: Error, ctx: RouterContext) => any;
  }
}

export {};
