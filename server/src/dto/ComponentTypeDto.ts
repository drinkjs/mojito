import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from "ngulf/class-validator";

export class ComponentTypeDto {
  @IsNotEmpty({ message: "id不能为空", groups: ["update"] })
  @IsMongoId({ message: "非法id", groups: ["update"] })
  id!: string;

  @IsNotEmpty({ message: "name不能为空", groups: ["add", "update"] })
  @MaxLength(30, { groups: ["add", "update"], message: "分类名称30字以内" })
  name!: string;

  @IsOptional({ groups: ["add", "update"] })
  @MaxLength(100, { groups: ["add", "update"] })
  icon?: string;

  @IsOptional({ groups: ["add", "update"] })
  @IsMongoId({ message: "非法pid", groups: ["add", "update"] })
  pid?: string;

  children?: ComponentTypeDto[];
}
