import { IsNotEmpty, MaxLength } from "class-validator";
import { IsObjectId } from "../common/Mongoer";
import { ComponentEvents, ComponentProps } from "../entity/ComponentEntity";

export class ComponentDto {
  @IsNotEmpty({ message: "id不能为空", groups: ["update"] })
  @IsObjectId({ message: "非法id", groups: ["update"] })
  id: string;

  @IsNotEmpty({ message: "name不能为空", groups: ["add", "update"] })
  @MaxLength(50, { groups: ["add", "update"] })
  name: string;

  @IsNotEmpty({ message: "title不能为空", groups: ["add", "update"] })
  @MaxLength(50, { groups: ["add", "update"] })
  title: string;

  @IsNotEmpty({ message: "type不能为空", groups: ["add", "update"] })
  @IsObjectId({ message: "非法类型", groups: ["add", "update"] })
  type: string;

  @IsNotEmpty({ message: "version不能为空", groups: ["add", "update"] })
  @MaxLength(10, { groups: ["add", "update"] })
  version: string;

  @IsNotEmpty({ message: "sid不能为空", groups: ["add"] })
  sid: string;

  coverImg?: string;

  createTime?: string;

  updateTime?: string;

  createUser?: string;

  origin: 1 | 2; // 来源:1系统2第三方

  props?: ComponentProps;

  events?: ComponentEvents;

  developLib: string;

  dependencies?: string[];
}
