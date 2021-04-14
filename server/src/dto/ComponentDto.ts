import { IsMongoId, IsNotEmpty, MaxLength } from "class-validator";
import { ComponentEvents, ComponentProps } from "../entity/ComponentEntity";

export class ComponentDto {
  @IsNotEmpty({ message: "id不能为空", groups: ["update"] })
  @IsMongoId({ message: "非法id", groups: ["update"] })
  id: string;

  @IsNotEmpty({ message: "name不能为空", groups: ["add", "update"] })
  @MaxLength(50, { groups: ["add", "update"] })
  name: string;

  @IsNotEmpty({ message: "title不能为空", groups: ["add", "update"] })
  @MaxLength(30, { groups: ["add", "update"], message: "组件显示名称30字以内" })
  title: string;

  @IsNotEmpty({ message: "type不能为空", groups: ["add", "update"] })
  @IsMongoId({ message: "非法类型", groups: ["add", "update"] })
  // 组件类型的id
  type: string;

  @IsNotEmpty({ message: "version不能为空", groups: ["add", "update"] })
  @MaxLength(10, { groups: ["add", "update"] })
  version: string;

  @IsNotEmpty({ message: "sid不能为空", groups: ["add"] })
   // 上传时组件临时存入的目录，上传组件时返回，新增组件时原样提交
  sid: string;

  coverImg?: string;

  createTime?: string;

  updateTime?: string;

  createUser?: string;

  origin: 1 | 2; // 来源:1系统2第三方

  props?: ComponentProps;

  events?: ComponentEvents;

  @IsNotEmpty({ message: "developLib不能为空", groups: ["add", "update"] })
  developLib: string;

  dependencies?: string[];
}
