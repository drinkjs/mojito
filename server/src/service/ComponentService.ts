import { mongoose } from "@typegoose/typegoose";
import { Injectable, MgModel, MgModelType, AppError } from "ngulf";
import ComponentTypeEntity from "../entity/ComponentTypeEntity";
import ComponentEntity from "../entity/ComponentEntity";
import { ComponentDto, ComponentTypeDto } from "../dto";
import { createStringDate } from "../common/utils";
import BaseService from "./BaseService";

@Injectable()
export default class ComponentService extends BaseService {
  @MgModel(ComponentTypeEntity)
  private typeModel!: MgModelType<ComponentTypeEntity>;

  @MgModel(ComponentEntity)
  private model!: MgModelType<ComponentEntity>;

  /**
   * 查询所有分类
   */
  async findTypes () {
    const rel = await this.typeModel.find({ status: 1 }).exec();
    if (!rel || rel.length === 0) {
      // 没有分类时创建一个默认分类
      const name = "自定义";
      const icon = "icon-zidingyi";
      const { _id: id } = await this.typeModel.create({
        name,
        icon,
        status: 1,
      });
      return [{ id, name, icon }];
    }
    return rel.map((v) => this.toDtoObject<ComponentTypeDto>(v));
  }

  /**
   * 添加分类
   * @param data
   * @returns
   */
  async addType (data: ComponentTypeDto) {
    const rel = await this.typeModel
      .findOne({ status: 1, name: data.name, pid: data.pid })
      .exec();
    if (rel) {
      AppError.assert(`${data.name}已经存在`);
    }
    const { _id: id } = await this.typeModel.create({
      ...data,
      status: 1,
    });
    return id;
  }

  /**
   * 删除分类
   * @param data
   * @returns
   */
  async delType (id: string) {
    let rel = await this.typeModel.findOne({ pid: id, status: 1 }).exec();
    // 如果存在子类不能删除
    if (rel) {
      AppError.assert("当前分类下下存在多个子类，请先删除子类");
    }
    const comp = await this.model.findOne({ type: id }).exec();
    if (comp) {
      AppError.assert("当前分类下存在多个组件，请先迁移组件");
    }
    rel = await this.typeModel.findByIdAndUpdate(id, { status: 0 });
    return rel;
  }

  /**
   * 更新分类
   * @param data
   * @returns
   */
  async updateType (data: ComponentTypeDto) {
    const rel = await this.typeModel.findByIdAndUpdate(
      data.id,
      {
        ...data,
        status: undefined,
      },
      { omitUndefined: true }
    );
    return rel;
  }

  /**
   * 查询组件
   * @param type
   */
  async findAll (type?: string) {
    const rel = await this.model.find({ type }).exec();
    return rel ? rel.map((v) => this.toDtoObject<ComponentDto>(v)) : [];
  }

  async findByName (name: string, version: string) {
    const rel = await this.model.findOne({ name, version }).exec();
    return rel && this.toDtoObject<ComponentDto>(rel);
  }

  async findById (id: string) {
    const rel = await this.model.findOne({ _id: id }).exec();
    return rel && this.toDtoObject<ComponentDto>(rel);
  }

  async findByIds (ids: string[]) {
    const orIds = ids.map((id) => ({ _id: id }));
    const rel = await this.model.find({ $or: orIds }).exec();
    return rel.map((v) => this.toDtoObject<ComponentDto>(v));
  }

  async add (data: ComponentDto) {
    const { _id: id } = await this.model.create({
      ...data,
      type: new mongoose.Types.ObjectId(data.type),
      createTime: createStringDate(),
      updateTime: createStringDate(),
    });
    return id;
  }

  async update (data: ComponentDto) {
    const rel = await this.model.findByIdAndUpdate(
      data.id,
      {
        ...data,
        id: undefined,
        createTime: undefined,
        type: new mongoose.Types.ObjectId(data.type),
        updateTime: createStringDate(),
      },
      { omitUndefined: true }
    );
    return rel;
  }

  async delete (id: string) {
    const rel = await this.model.findOneAndDelete({ _id: id });
    return rel;
  }
}
