import { IsNotEmpty, MaxLength } from "class-validator";
import { IsObjectId } from "../common/Mongoer";
import { LayerApi, LayerStyle } from "../entity/LayerEntity";
import { ComponentDto } from "./ComponentDto";

export class LayerDto {
  @IsObjectId({ message: "非法id", groups: ["update"] })
  @IsNotEmpty({ message: "缺少图层id", groups: ["update"] })
  id: string;

  @IsNotEmpty({ message: "name不能为空", groups: ["add"] })
  @MaxLength(50, { groups: ["add", "update"] })
  name: string;

  @IsObjectId({ message: "非法id", groups: ["add"] })
  @IsNotEmpty({ message: "screenId不能为空", groups: ["add"] })
  screenId: string;

  @IsObjectId({ message: "非法id", groups: ["add"] })
  @IsNotEmpty({ message: "componentId不能为空", groups: ["add"] })
  componentId: string;

  initSize: boolean;

  component: ComponentDto; // 图层的组件

  props?: { [key: string]: any };

  events?: { [key: string]: any };

  eventLock?: boolean; // 事件锁定，组件不再响应交互事件

  @IsNotEmpty({ message: "style不能为空", groups: ["add"] })
  style: LayerStyle;

  api?: LayerApi;

  isHide: boolean;

  isLock: boolean;

  status: 0 | 1;

  group?: string;

  groupLock?: boolean;

  groupHide?: boolean;

  reloadKey?: number;

  anime?: { [key: string]: any };
}
