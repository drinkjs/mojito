import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Validation,
  BaseController,
} from "ngulf";
import { ProjectDto } from "../dto";
import ProjectService from "../service/ProjectService";

@Controller("/project")
export default class ProjectController extends BaseController {
  // eslint-disable-next-line no-unused-vars
  constructor (private readonly service: ProjectService) {
    super();
  }

  /**
   * 新增项目
   * @param dto
   */
  @Post("/add")
  async add (@Body(new Validation({ groups: ["add"] })) dto: ProjectDto) {
    dto.name = dto.name.replace("/", "");
    if (!dto.name) {
      return this.fail("添加失败");
    }
    const relId = await this.service.add(dto);
    if (relId) return this.success(relId);
    return this.fail("添加失败");
  }

  /**
   * 编辑项目
   * @param dto
   */
  @Post("/update")
  async update (@Body(new Validation({ groups: ["update"] })) dto: ProjectDto) {
    dto.name = dto.name.replace("/", "");
    if (!dto.name) {
      return this.fail("添加失败");
    }
    const rel = await this.service.update(dto);
    if (rel) return this.success(null);
    return this.fail("更新失败");
  }

  /**
   * 项目列表
   */
  @Get("/list")
  async list () {
    const rel = await this.service.findAll();
    return this.success(rel);
  }

  /**
   * 删除项目
   * @param id
   */
  @Get("/delete")
  async delete (@Query("id") id: string) {
    const rel = await this.service.delete(id);
    if (rel) return this.success(null);
    return this.fail("删除失败");
  }
}
