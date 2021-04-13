import { IsNotEmpty, MaxLength } from "class-validator";
import { IsObjectId } from "../common/Mongoer";

export class ComponentTypeDto {
  @IsNotEmpty({ message: "id不能为空", groups: ["update"] })
  @IsObjectId({ message: "非法id", groups: ["update"] })
  id: string;

  @IsNotEmpty({ message: "name不能为空", groups: ["add", "update"] })
  @MaxLength(50, { groups: ["add", "update"] })
  name: string;

  @IsNotEmpty({ message: "icon不能为空", groups: ["add", "update"] })
  @MaxLength(100, { groups: ["add", "update"] })
  icon: string;

  pid?: string;

  children?: ComponentTypeDto[];
}
