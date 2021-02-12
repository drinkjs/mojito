import { IsNotEmpty } from "class-validator";
import { IsObjectId } from "common/Mongoer";

export class ProjectDto {
  @IsNotEmpty({ message: "请输入项目id", groups: ["update"] })
  @IsObjectId({ message: "非法id", groups: ["update"] })
  id: string;

  @IsNotEmpty({ message: "请输入项目名称", groups: ["add", "update"] })
  name: string;

  createUser?: string;

  createTime?: string;

  @IsNotEmpty({ message: "请输入cdn配置", groups: ["updateCDN"] })
  cdn: string[];
}
