import * as fs from "fs";
import * as path from "path";
import * as compressing from "compressing";
import { Body, Controller, Get, Post, Query, Validation } from "../core";
import { ComponentDto, ComponentTypeDto } from "../dto";
import ComponentService from "../service/ComponentService";
import AppError from "../common/AppError";
import { tmpdir } from "os";
import config from "../config";
import BaseController from "./BaseController";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ncp } = require("ncp");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rimraf = require("rimraf");

function rmdir (dir: string) {
  rimraf(dir, {}, (rel: any) => {
    if (rel) {
      // reject(new Error("清理失败"))
    }
  });
}

@Controller("/component")
export default class ComponentController extends BaseController {
  // eslint-disable-next-line no-unused-vars
  constructor (private readonly service: ComponentService) {
    super();
  }

  private readonly libSavePath = config.libPath;

  /**
   * 类型树
   * @param types
   * @param pid
   */
  formatTypes (types: ComponentTypeDto[], pid: string): ComponentTypeDto[] {
    const arr: ComponentTypeDto[] = [];
    types.forEach((v) => {
      if (v.pid === pid) {
        const children = this.formatTypes(types, v.id);
        if (children.length > 0) {
          v.children = children;
        }
        arr.push(v);
      }
    });
    return arr;
  }

  /**
   * 解压zip
   * @param zipFile
   * @param dest
   */
  unzip (zipFile: any, dest: string, libId?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // 创建临时目录
      fs.mkdtemp(path.join(tmpdir(), "compoents-"), (err, directory) => {
        if (err) reject(err);
        // 解压到临时目录
        compressing.zip
          .uncompress(zipFile, directory)
          .then(() => {
            // 读取描述文件
            const decFile = `${directory}${path.sep}declare.json`;
            fs.open(decFile, "r", async (openErr, fd) => {
              if (openErr) {
                rmdir(directory);
                reject(new Error(`读取declare.json失败:${openErr.code}`));
              }
              // 读取描述文件内容
              const descText = fs.readFileSync(fd, { encoding: "utf8" });
              fs.closeSync(fd);

              try {
                const descJson = JSON.parse(descText);
                if (!descJson.name || !descJson.version) {
                  rmdir(directory);
                  reject(
                    new Error("解释declare.json失败，请写上name和version")
                  );
                }

                if (!libId) {
                  // 新增
                  const rel = await this.service.findByName(
                    descJson.name,
                    descJson.version
                  );
                  if (rel) {
                    reject(new Error(`${descJson.name}已经存在`));
                    return;
                  }
                } else {
                  // 修改
                  const rel = await this.service.findById(libId);
                  if (!rel || rel.name !== descJson.name) {
                    reject(new Error("上传的组件与原组件不一致"));
                    return;
                  }
                }
                // 创建存放组件的目录
                const savePath = `${dest}${path.sep}${descJson.name}${descJson.version}`;
                fs.mkdirSync(savePath, { recursive: true });
                // 复制文件
                ncp(directory, savePath, (ncperr: any) => {
                  rmdir(directory);
                  if (ncperr) {
                    reject(new Error(`${descJson.name}保存失败`));
                  }
                  // 保存成功
                  resolve({
                    ...descJson,
                  });
                });
              } catch (e) {
                console.log(e);
                rmdir(directory);
                reject(new Error("解释package.json失败"));
              }
            });
          })
          .catch(() => {
            rmdir(directory);
            reject(new Error("解压失败"));
          });
      });
    });
  }

  /**
   * 组件类型树
   */
  @Get("/types")
  async getTypes (): PromiseRes<ComponentTypeDto[]> {
    const rel = await this.service.findTypes();
    return this.success(rel ? this.formatTypes(rel, undefined) : []);
  }

  /**
   * 组件列表
   */
  @Get("/list")
  async list (@Query() query: any): PromiseRes<ComponentDto[]> {
    const { type } = query || {};
    const rel = await this.service.findAll(type);
    return this.success(rel);
  }

  /**
   * 上传组件
   * @param file
   */
  @Post("/upload")
  async upload (ctx: RouterContext): PromiseRes<any> {
    const { req } = ctx;
    const data = await req.file();
    const fields = data.fields as any;
    const rel = await this.unzip(
      data.file,
      this.libSavePath,
      fields.libId ? fields.libId.value : undefined
    ).catch((error: Error) => {
      AppError.assert(error ? error.message : "上传失败");
    });
    return this.success(rel);
  }

  /**
   * 增加三方组件
   * @param dto
   */
  @Post("/add")
  async addComponent (
    @Body(new Validation({ groups: ["add"] })) dto: ComponentDto
  ): PromiseRes<any> {
    const rel = await this.service.add({ ...dto, origin: 2 });
    if (rel) return this.success(rel);

    return this.fail("添加失败");
  }

  /**
   * 修改三方组件
   * @param dto
   */
  @Post("/update")
  async updateComponent (
    @Body(new Validation({ groups: ["update"] })) dto: ComponentDto
  ): PromiseRes<any> {
    const rel = await this.service.update({ ...dto, origin: 2 });
    if (rel) return this.success(null);

    return this.fail("更新失败");
  }

  /**
   * 组件列表
   */
  @Get("/delete")
  async del (@Query("id") id: string): PromiseRes<any> {
    const rel = await this.service.delete(id);
    if (rel) {
      // 删除组件目录
      const savePath = `${this.libSavePath}${path.sep}${rel.name}${rel.version}`;
      rmdir(savePath);
    } else {
      return this.fail("删除失败");
    }
    return this.success(null);
  }

  /**
   * 组件详情
   */
  @Get("/detail")
  async detail (@Query("id") id: string): PromiseRes<ComponentDto> {
    const rel = await this.service.findById(id);
    return this.success(rel);
  }
}
