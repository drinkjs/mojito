import { mongoose } from "@typegoose/typegoose";
import AppError from "../common/AppError";
import { createStringDate } from "../common/utils";
import { Injectable, MgModel, MgModelType } from "../core/decorator";
import { LayerDto } from "../dto";
import LayerEntity from "../entity/LayerEntity";
import BaseService from "./BaseService";

@Injectable()
export default class LayerService extends BaseService {
  @MgModel(LayerEntity)
  private model!: MgModelType<LayerEntity>;

  async findAll (screenId: string) {
    const rel = await this.model
      .find({ screenId, status: 1 }, { screenId: 0, status: 0 })
      .populate({
        path: "componentId",
        select: "libName version title type origin props events",
      })
      .exec();
    if (rel && rel.length > 0) {
      return rel.map((v) => {
        const dto = this.toDtoObject<LayerDto>(v);
        const component: any = v.componentId;
        if (component) {
          const {
            libName,
            version,
            title,
            type,
            origin,
            _id: id,
            props,
            events,
          } = component;
          dto.component = {
            libName,
            version,
            title,
            id,
            type,
            origin,
            props,
            events,
          };
        }
        delete dto.componentId;
        return dto;
      });
    }
    return [];
  }

  async add (data: LayerDto) {
    const layer: LayerEntity = {
      ...data,
      screenId: new mongoose.Types.ObjectId(data.screenId),
      componentId: new mongoose.Types.ObjectId(data.componentId),
      createTime: createStringDate(),
      updateTime: createStringDate(),
      status: 1,
    };
    const { _id: id } = await this.model.create(layer);
    return id;
  }

  async update (data: LayerDto) {
    const rel = await this.model.findByIdAndUpdate(
      data.id,
      {
        ...data,
        screenId: undefined,
        componentId: undefined,
        component: undefined,
        id: undefined,
        updateTime: createStringDate(),
      },
      { omitUndefined: true }
    );
    return rel;
  }

  /**
   * 删除图层
   * @param id
   */
  async delete (id: string) {
    const rel = await this.model.findByIdAndUpdate(
      id,
      {
        status: 0,
        updateTime: createStringDate(),
      },
      { omitUndefined: true }
    );
    return rel;
  }

  /**
   * 恢复已删除的图层
   * @param id
   */
  async restore (id: string) {
    const rel = await this.model.findByIdAndUpdate(
      id,
      {
        status: 1,
        updateTime: createStringDate(),
      },
      { omitUndefined: true }
    );
    return rel;
  }

  /**
   * 批量更新
   * @param data
   */
  async batchUpdate (data: LayerDto[]) {
    const bulk = this.model.collection.initializeUnorderedBulkOp();
    data.forEach((v) => {
      const { id } = v;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        AppError.assert("错误的id");
      }
      delete v.id;
      bulk
        .find({ _id: new mongoose.Types.ObjectId(id) })
        .updateOne({ $set: { ...v, updateTime: createStringDate() } });
    });
    const rel = await bulk.execute();
    return rel;
  }
}
