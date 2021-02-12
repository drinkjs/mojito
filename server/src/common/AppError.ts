export default class AppError extends Error {
  static assert (msg: string) {
    throw new AppError(msg);
  }
}
