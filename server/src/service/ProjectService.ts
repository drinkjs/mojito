/* eslint-disable no-underscore-dangle */
import { Injectable, MgModel, MgModelType, AppError } from "ngulf";
import { ProjectDto } from "../dto";
import ProjectEntity from "../entity/ProjectEntity";
import { createStringDate } from "../common/utils";
import BaseService from "./BaseService";

@Injectable()
export default class ProjectService extends BaseService {
  @MgModel(ProjectEntity)
  private model!: MgModelType<ProjectEntity>;

  /**
   * 新增项目
   * @param data
   */
  async add (data: ProjectDto) {
    const rel = await this.model.findOne({ name: data.name, status: 1 }).exec();
    if (rel) {
      AppError.assert("项目已存在");
    }

    if (!data.name) {
      AppError.assert("请输入项目名称");
      return;
    }
    const project: ProjectEntity = {
      name: data.name,
      createTime: createStringDate(),
      updateTime: createStringDate(),
      status: 1,
    };
    const { _id: id } = await this.model.create(project);
    return id;
  }

  /**
   * 查询所有项目
   */
  async findAll () {
    const rel = await this.model
      .find({ status: 1 })
      .sort({ createTime: -1 })
      .exec();
    return rel.map((v) => this.toDtoObject<ProjectDto>(v));
  }

  /**
   * 根据项目名返回项目信息
   * @param name
   */
  async findByName (name: string) {
    const rel = await this.model
      .findOne({ status: 1, name })
      .sort({ createTime: -1 })
      .exec();
    return rel && this.toDtoObject<ProjectDto>(rel);
  }

  /**
   * 更新项目
   * @param data
   */
  async update (data: ProjectDto) {
    let rel = await this.model.findOne({ name: data.name, status: 1 }).exec();
    if (rel && rel.id !== data.id) {
      AppError.assert("项目已存在");
    }

    rel = await this.model.findByIdAndUpdate(
      data.id,
      { name: data.name, updateTime: createStringDate() },
      { omitUndefined: true }
    );
    return rel;
  }

  /**
   * 删除项目
   * @param id
   */
  async delete (id: string) {
    const rel = await this.model.findByIdAndUpdate(id, { status: 0 });
    return rel;
  }
}
