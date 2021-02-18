import { IsNotEmpty } from "class-validator";
import { IsObjectId } from "../common/Mongoer";

export class ComponentTypeDto {
  @IsNotEmpty({ message: "id不能为空", groups: ["add"] })
  @IsObjectId({ message: "非法id", groups: ["add"] })
  id: string;

  @IsNotEmpty({ message: "name不能为空", groups: ["add"] })
  name: string;

  icon?: string;

  pid?: string;

  children?: ComponentTypeDto[];
}
