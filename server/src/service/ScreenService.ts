import { mongoose } from "@typegoose/typegoose";
import { Injectable, MgModel, MgModelType } from "../core/decorator";
import { ScreenDto } from "../dto";
import AppError from "../common/AppError";
import { createStringDate } from "../common/utils";
import ScreenEntity from "../entity/ScreenEntity";
import BaseService from "./BaseService";
import ProjectService from "./ProjectService";
import ComponentService from "./ComponentService";

@Injectable()
export default class ScreenService extends BaseService {
  constructor (
    // eslint-disable-next-line no-unused-vars
    private readonly projectService: ProjectService,
    // eslint-disable-next-line no-unused-vars
    private readonly componentService: ComponentService
  ) {
    super();
  }

  @MgModel(ScreenEntity)
  private model: MgModelType<ScreenEntity>;

  /**
   * 新增页面
   * @param data
   */
  async add (data: ScreenDto) {
    const rel = await this.model
      .findOne({ name: data.name, status: 1, projectId: data.projectId })
      .exec();
    if (rel) {
      AppError.assert("页面已存在");
    }
    const project: ScreenEntity = {
      projectId: new mongoose.Types.ObjectId(data.projectId),
      name: data.name,
      style: data.style,
      createTime: createStringDate(),
      updateTime: createStringDate(),
      status: 1,
    };
    const { _id: id } = await this.model.create(project);
    return id;
  }

  /**
   * 查询项目下的所有页面
   */
  async findByProject (projectId: string) {
    const rel = await this.model
      .find({ status: 1, projectId }, { status: 0, projectId: 0 })
      .sort({ updateTime: -1 })
      .exec();
    return rel && rel.map((v) => this.toDtoObject<ScreenDto>(v));
  }

  /**
   * 查询项目下的所有页面
   */
  async findByProjectName (name: string) {
    const projectInfo = await this.projectService.findByName(name);
    if (!projectInfo) return [];
    const rel = await this.model
      .find(
        { status: 1, projectId: projectInfo.id },
        { status: 0, projectId: 0 }
      )
      .sort({ updateTime: -1 })
      .exec();
    return rel && rel.map((v) => this.toDtoObject<ScreenDto>(v));
  }

  /**
   * 页面详细信息
   * @param id
   * @returns
   */
  async findDetailById (id: string, projectId?: any) {
    if (!id) return null;

    const rel = await this.model
      .findOne(
        mongoose.Types.ObjectId.isValid(id)
          ? { _id: id, status: 1 }
          : { name: id, status: 1, projectId },
        { coverImg: 0, createTime: 0 }
      )
      .populate({ path: "projectId", select: "name cdn" })
      .exec();
    const detail = this.toDtoObject<ScreenDto>(rel);
    if (rel) {
      if (rel.layers && rel.layers.length > 0) {
        // 查询图层组件信息
        const componentIds = rel.layers.map((v) => v.component);
        const components = await this.componentService.findByIds(componentIds);
        rel.layers.forEach((layer, index) => {
          const component = components.find(
            (comp) => comp.id === layer.component
          );
          detail.layers[index].component = component;
        });
      }
      const project: any = rel.projectId;
      const { name, cdn, _id } = project;
      detail.project = { name, cdn, id: _id };
      delete detail.projectId;
    }
    return detail;
  }

  /**
   * 更新页面信息
   * @param data
   */
  async update (data: ScreenDto) {
    let rel = await this.model
      .findOne({ name: data.name, projectId: data.projectId, status: 1 })
      .exec();
    if (rel && rel.id !== data.id) {
      AppError.assert("页面已存在");
    }
    rel = await this.model.findByIdAndUpdate(
      data.id,
      {
        name: data.name,
        style: data.style,
        updateTime: createStringDate(),
      },
      { omitUndefined: true }
    );
    return rel;
  }

  /**
   * 更新页面图层信息
   * @param data
   * @returns
   */
  async updateScreen (data: ScreenDto) {
    const rel = await this.model.findByIdAndUpdate(
      data.id,
      {
        layers: data.layers
          ? data.layers.map((v) => ({ ...v, component: v.component?.id }))
          : [],
        style: data.style,
        updateTime: createStringDate(),
      },
      { omitUndefined: true }
    );
    return rel;
  }

  /**
   * 更新页面封面
   * @param id
   * @param imgPath
   */
  async updateCover (id: string, imgPath: string) {
    const rel = await this.model.findByIdAndUpdate(id, {
      coverImg: imgPath,
    });
    return rel;
  }

  /**
   * 删除页面
   * @param id
   */
  async delete (id: string) {
    const rel = await this.model.findByIdAndUpdate(id, { status: 0 });
    return rel;
  }
}
