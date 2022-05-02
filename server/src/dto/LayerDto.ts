import { IsMongoId, IsNotEmpty, MaxLength } from "ngulf/class-validator";
import { LayerApi, LayerStyle, RelativePosition } from "../entity/LayerEntity";
import { ComponentDto } from "./ComponentDto";

export class LayerDto {
  @IsMongoId({ message: "非法id", groups: ["update"] })
  @IsNotEmpty({ message: "缺少图层id", groups: ["update"] })
  id!: string;

  @IsNotEmpty({ message: "name不能为空", groups: ["add"] })
  @MaxLength(30, { groups: ["add", "update"], message: "图层名称30字以内" })
  name!: string;

  @IsMongoId({ message: "非法id", groups: ["add"] })
  @IsNotEmpty({ message: "screenId不能为空", groups: ["add"] })
  screenId!: string;

  @IsMongoId({ message: "非法id", groups: ["add"] })
  @IsNotEmpty({ message: "componentId不能为空", groups: ["add"] })
  componentId!: string;

  initSize: boolean = false;

  component!: ComponentDto; // 图层的组件

  props?: { [key: string]: any };

  events?: { [key: string]: any };

  eventLock?: boolean; // 事件锁定，组件不再响应交互事件

  @IsNotEmpty({ message: "style不能为空", groups: ["add"] })
  style!: LayerStyle;

  api?: LayerApi;

  isHide: boolean = false;

  isLock: boolean = false;

  status!: 0 | 1;

  group?: string;

  groupLock?: boolean;

  groupHide?: boolean;

  reloadKey?: number;

  anime?: { [key: string]: any };

  relativePosition?: {
    x?: RelativePosition;
    y?: RelativePosition;
  }; // 相对位置
}
