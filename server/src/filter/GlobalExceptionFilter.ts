import AppError from "../common/AppError";

export default class GlobalExceptionFilter implements ExceptionFilter {
  // eslint-disable-next-line no-undef
  catch (err: Error, ctx: RouterContext) {
    if (err instanceof AppError) {
      ctx.res.send({
        code: 200,
        msg: err.message,
      });
    } else {
      ctx.res.send({
        code: 500,
        msg: err.toString(),
      });
    }
  }
}
