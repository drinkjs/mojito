export default class BaseController {
  fail<T> (msg: string, code = 1): IResult<T> {
    return {
      code,
      msg,
    };
  }

  success<T> (data: T, msg?: string): IResult<T> {
    return {
      code: 0,
      data,
      msg,
    };
  }
}
