import { mongoose } from "@typegoose/typegoose";
import { Injectable, MgModel, MgModelType } from "../core/decorator";
import ComponentTypeEntity from "../entity/ComponentTypeEntity";
import ComponentEntity from "../entity/ComponentEntity";
import { ComponentDto, ComponentTypeDto } from "../dto";
import { createStringDate } from "../common/utils";
import { DefaultComponentTypes } from "../config";
import BaseService from "./BaseService";

@Injectable()
export default class ComponentService extends BaseService {
  @MgModel(ComponentTypeEntity)
  private typeModel: MgModelType<ComponentTypeEntity>;

  @MgModel(ComponentEntity)
  private model: MgModelType<ComponentEntity>;

  /**
   * 查询所有分类
   */
  async findTypes () {
    const rel = await this.typeModel.find().exec();
    if (!rel || rel.length === 0) return DefaultComponentTypes;
    return rel.map((v) => this.toDtoObject<ComponentTypeDto>(v));
  }

  /**
   * 查询组件
   * @param type
   */
  async findAll (type?: string) {
    const rel = await this.model.find({ type }).exec();
    return rel.map((v) => this.toDtoObject<ComponentDto>(v));
  }

  async findByName (libName: string, version: string) {
    const rel = await this.model.findOne({ libName, version }).exec();
    return this.toDtoObject<ComponentDto>(rel);
  }

  async findById (id: string) {
    const rel = await this.model.findOne({ _id: id }).exec();
    return this.toDtoObject<ComponentDto>(rel);
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
