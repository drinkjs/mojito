import { IsMongoId, IsNotEmpty, MaxLength } from "ngulf/class-validator";
import { DatasourceInfo, ScreenOptions } from "../entity/ScreenEntity";
import { LayerDto } from "./LayerDto";
import { ProjectDto } from "./ProjectDto";

export class ScreenDto {
  @IsMongoId({ message: "非法projectId", groups: ["add"] })
  @IsNotEmpty({ message: "请输入项目id", groups: ["add"] })
  projectId?: string;

  @IsMongoId({
    message: "非法id",
    groups: ["update", "coverImg", "updateLayer"],
  })
  @IsNotEmpty({
    message: "请输入页面id",
    groups: ["update", "coverImg", "updateLayer"],
  })
  id!: string;

  @IsNotEmpty({ message: "请输入页面名称", groups: ["add", "update"] })
  @MaxLength(30, { groups: ["add", "update"], message: "页面名称30字以内" })
  name!: string;

  style?: ScreenOptions;

  createUser?: string;

  createTime?: string;

  @IsNotEmpty({ message: "请上传封面图片", groups: ["coverImg"] })
  coverImg?: string;

  layers?: LayerDto[];

  project?: ProjectDto;

  dataSources?: DatasourceInfo[];
}
