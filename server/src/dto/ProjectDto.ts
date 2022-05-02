import { IsMongoId, IsNotEmpty, MaxLength } from "ngulf/class-validator";

export class ProjectDto {
  @IsNotEmpty({ message: "请输入项目id", groups: ["update"] })
  @IsMongoId({ message: "非法id", groups: ["update"] })
  id!: string;

  @IsNotEmpty({ message: "请输入项目名称", groups: ["add", "update"] })
  @MaxLength(30, { groups: ["add", "update"], message: "项目名称30字以内" })
  name!: string;

  createUser?: string;

  createTime?: string;

  updateTime?: string;
}
