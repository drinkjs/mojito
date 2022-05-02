import { AppError } from "ngulf";
import { FastifyInstance } from "ngulf/fastify";

export default async function hook (server: FastifyInstance) {
  // 异常处理
  server.setErrorHandler((error, request, reply) => {
    // reply.hijack(); // ?,??
    if (error instanceof AppError) {
      reply.send({
        code: 1,
        msg: error.message,
      });
    } else {
      reply.send({
        code: 500,
        msg:
          process.env.NODE_ENV === "development"
            ? error.message
            : "系统异常，请联系管理员",
      });
    }
  });
}
