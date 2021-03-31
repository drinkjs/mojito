import { Validation } from "../core";
import { Body, Controller, Get, Post, Query } from "../core/decorator";
import { ScreenDto } from "../dto";
import ScreenService from "../service/ScreenService";
import BaseController from "./BaseController";

@Controller("/screen")
export default class ScreenController extends BaseController {
  // eslint-disable-next-line no-unused-vars
  constructor (private readonly service: ScreenService) {
    super();
  }

  /**
   * 新增页面
   * @param dto
   */
  @Post("/add")
  async add (
    @Body(new Validation({ groups: ["add"] })) dto: ScreenDto
  ): PromiseRes<string> {
    const relId = await this.service.add(dto);
    if (relId) return this.success(relId);
    return this.fail("添加失败");
  }

  /**
   * 项目页面列表
   * @param projectId
   */
  @Get("/list")
  async list (@Query("projectId") projectId: string): PromiseRes<ScreenDto[]> {
    const rel = await this.service.findByProject(projectId);
    return this.success(rel);
  }

  /**
   * 通过项目名返回页面
   * @param name
   */
  @Get("/list/projectName")
  async listByProjectName (
    @Query("name") name: string
  ): PromiseRes<ScreenDto[]> {
    const rel = await this.service.findByProjectName(name);
    return this.success(rel);
  }

  /**
   * 更新页面信息
   * @param dto
   */
  @Post("/update")
  async update (
    @Body(new Validation({ groups: ["update"] })) dto: ScreenDto
  ): PromiseRes<any> {
    const rel = await this.service.update(dto);
    if (rel) return this.success(null);
    return this.fail("更新失败");
  }

  /**
   * 更新页面图层信息
   * @param dto
   */
  @Post("/update/layer")
  async updateLayer (
    @Body(new Validation({ groups: ["updateLayer"] })) dto: ScreenDto
  ): PromiseRes<any> {
    const rel = await this.service.updateScreen(dto);
    if (rel) return this.success(null);
    return this.fail("图层更新失败");
  }

  /**
   * 修改封面
   * @param dto
   */
  @Post("/update/cover")
  async updateCover (
    @Body(new Validation({ groups: ["coverImg"] })) dto: ScreenDto
  ): PromiseRes<any> {
    const rel = await this.service.updateCover(dto.id, dto.coverImg);
    if (rel) return this.success(null);
    return this.fail("更新失败");
  }

  /**
   * 删除页面
   * @param id
   */
  @Get("/delete")
  async delete (@Query("id") id: string): PromiseRes<any> {
    const rel = await this.service.delete(id);
    if (rel) {
      return this.success(null);
    }
    return this.fail("删除失败");
  }

  /**
   * 页面明细
   * @param id
   */
  @Get("/detail")
  async detail (@Query("id") id: string): PromiseRes<ScreenDto | null> {
    const rel = await this.service.findDetailById(id);
    return this.success(rel);
  }

  /**
   * 预览大屏信息
   * @param params
   */
  @Get("/view")
  async view (@Query("id") id: string): PromiseRes<any> {
    const rel = await this.service.findDetailById(id);
    return this.success(rel);
  }
}
