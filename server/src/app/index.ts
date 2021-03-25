/* eslint-disable no-unused-vars */
import "reflect-metadata";
import "colors";
import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import config from "../config";
import loader from "./loader";

export const server: FastifyInstance = Fastify({ logger: config.logger });

export async function launch () {
  try {
    await loader(server);
    await server.listen(config.port);
    console.info(`server listening on ${config.port}`);
  } catch (err) {
    server.log.error(err);
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
  }
  type PromiseRes<T> = Promise<IResult<T>>;
  interface ExceptionFilter {
    catch: (error: Error, ctx: RouterContext) => any;
  }
}

export {};
