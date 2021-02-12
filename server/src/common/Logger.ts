import { createLogger, format, transports } from "winston";

const moment = require("moment");

const { combine, timestamp, label, printf } = format;

export default class Logger {
  logger: any;

  constructor () {
    const myFormat = printf(
      (info) =>
        `${moment(info.timestamp).format("YYYY-MM-DD HH:mm:ss")} ${
          info.level
        }: ${info.message}`
    );

    this.logger = createLogger({
      format: combine(label({ label: "" }), timestamp(), myFormat),
      transports: [
        new transports.File({
          level: "error",
          filename: "log/error.log",
          maxsize: 1024 * 1024,
        }),
        new transports.Console({
          level: "info",
        }),
      ],
      exceptionHandlers: [
        new transports.File({
          maxsize: 1024 * 1024,
          filename: "log/exceptions.log",
        }),
      ],
    });
  }

  error (msg, params) {
    this.logger.error(this.parseMsg(msg, params));
  }

  info (msg, ...params) {
    this.logger.info(this.parseMsg(msg, params));
  }

  debug (msg, params) {
    this.logger.debug(this.parseMsg(msg, params));
  }

  log (msg, params) {
    const str = this.parseMsg(msg);
    if (process.env.NODE_ENV === "production") {
      this.error(str, params);
    } else {
      this.info(str, params);
    }
  }

  parseMsg (msg, ...params) {
    const str =
      msg instanceof Error
        ? `${msg.message} ${msg.stack}`
        : `${msg} ${params.join(" ")}`;
    return str;
  }
}
