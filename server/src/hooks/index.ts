import { FastifyInstance } from "fastify";
import AppError from "src/common/AppError";

/**
 * fastify hook配置，详情 https://www.fastify.cn/docs/latest/Hooks/
 * @param fastify
 */
export default async function hooks (fastify: FastifyInstance) {
  // 异常处理
  fastify.setErrorHandler(function (error, request, reply) {
    reply.hijack();
    if (error instanceof AppError) {
      reply.send({
        code: 200,
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

  // fastify.addHook('onRequest', async (request, reply) => {
  //   await asyncMethod()
  // });
}
