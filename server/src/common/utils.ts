import { Like } from "typeorm";
const dayjs = require("dayjs");

export function createStringDate (format?: string) {
  return dayjs().format(format || "YYYY-MM-DD HH:mm:ss");
}

/**
 * 表格查询
 * @param target 查询项数组
 * @param params 查询参数
 */
export function createTableSearchConfig (
  target?: string[],
  params?: { [key: string]: any }
) {
  const config: { [key: string]: any } = { status: 1 };
  if (target && target.length) {
    target.forEach((key) => {
      if (params && params[key]) {
        config[key] = Like(`%${params[key] || ""}%`);
      }
    });
  }

  return config;
}

/**
 * 表格升降序
 * @param params 查询参数
 */
export function createTableSorterConfig (params?: any) {
  const config: any = {};

  if (params) {
    const sorter = JSON.parse(params);

    Object.keys(sorter).forEach((key) => {
      config[key] = sorter[key] === "ascend" ? "ASC" : "DESC";
    });
  } else {
    config.createTime = "DESC";
  }
  return config;
}
