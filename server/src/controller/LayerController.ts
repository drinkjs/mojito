import { Body, Controller, Get, Post, Query, Validation } from "../core";
import { LayerDto } from "../dto";
import LayerService from "../service/LayerService";
import BaseController from "./BaseController";

@Controller("/layer")
export default class LayerController extends BaseController {
  // eslint-disable-next-line no-unused-vars
  constructor (private readonly service: LayerService) {
    super();
  }

  /**
   * 新增图层
   * @param dto
   */
  @Post("/add")
  async add (
    @Body(new Validation({ groups: ["add"] })) dto: LayerDto
  ): PromiseRes<any> {
    const rel = await this.service.add(dto);
    if (rel) {
      return this.success(rel);
    }
    return this.fail("图层添加失败");
  }

  /**
   * 更新图层
   * @param dto
   */
  @Post("/update")
  async update (
    @Body(new Validation({ groups: ["update"] })) dto: LayerDto
  ): PromiseRes<any> {
    const rel = await this.service.update(dto);
    if (rel) {
      return this.success(null);
    }
    return this.fail("图层更新失败");
  }

  /**
   * 删除图层
   * @param id
   */
  @Get("/delete")
  async del (@Query("id") id: string): PromiseRes<any> {
    const rel = await this.service.delete(id);
    if (rel) {
      return this.success(null);
    }
    return this.fail("图层删除失败");
  }

  /**
   * 删除恢复
   * @param id
   */
  @Get("/restore")
  async restore (@Query("id") id: string): PromiseRes<any> {
    const rel = await this.service.restore(id);
    if (rel) {
      return this.success(null);
    }
    return this.fail("图层恢复失败");
  }

  /**
   * 批量更新
   * @param dto
   */
  @Post("/batch/update")
  async batchUpdate (@Body() dto: LayerDto[]): PromiseRes<any> {
    const rel = await this.service.batchUpdate(dto);
    if (rel) {
      return this.success(null);
    }
    return this.fail("图层更新失败");
  }
}
