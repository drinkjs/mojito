import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { Controller, Post } from "../core/decorator";
import { createStringDate } from "../common/utils";
import config from "../config";
import BaseController from "./BaseController";

@Controller()
export default class CommonController extends BaseController {
  private readonly staticPath = config.staticPath;

  /**
   * 上传图片
   * @param file
   */
  @Post("/upload/image")
  async uploadImage (ctx: RouterContext): PromiseRes<any> {
    const { req } = ctx;
    const files = await req.saveRequestFiles();
    const file = files[0];
    if (!file.mimetype || file.mimetype.indexOf("image/") === -1) {
      return this.fail("只能上传图片格式文件");
    }

    const dataPath = `upload/${createStringDate("YYYYMMDD")}`;
    // 后缀名
    const extArr = file.filename.split(".");
    const ext =
      extArr.length > 1 ? extArr[extArr.length - 1].toLowerCase() : "";
    const fileName = uuidv4();

    const urlPath = `${dataPath}/${fileName}.${ext}`;
    const savePath = `${this.staticPath}/${urlPath}`;

    // 创建目录并复制文件
    fs.mkdirSync(`${this.staticPath}/${dataPath}`, { recursive: true });
    fs.createReadStream(file.filepath).pipe(fs.createWriteStream(savePath));

    return this.success({ path: `${config.staticPrefix}${urlPath}` });
  }
}
