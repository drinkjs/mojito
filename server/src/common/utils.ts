import dayjs from "dayjs";

export function createStringDate (format?: string) {
  return dayjs().format(format || "YYYY-MM-DD HH:mm:ss");
}
