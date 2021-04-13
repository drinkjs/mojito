import { IsNotEmpty, MaxLength } from "class-validator";
import { IsObjectId } from "../common/Mongoer";
import { ScreenOptions } from "../entity/ScreenEntity";
import { LayerDto } from "./LayerDto";
import { ProjectDto } from "./ProjectDto";

export class ScreenDto {
  @IsObjectId({ message: "非法id", groups: ["add"] })
  @IsNotEmpty({ message: "请输入项目id", groups: ["add"] })
  projectId: string;

  @IsObjectId({
    message: "非法id",
    groups: ["update", "coverImg", "updateLayer"],
  })
  @IsNotEmpty({
    message: "请输入页面id",
    groups: ["update", "coverImg", "updateLayer"],
  })
  id: string;

  @IsNotEmpty({ message: "请输入页面名称", groups: ["add", "update"] })
  @MaxLength(50, { groups: ["add", "update"] })
  name: string;

  style?: ScreenOptions;

  createUser?: string;

  createTime?: string;

  @IsNotEmpty({ message: "请上传封面图片", groups: ["coverImg"] })
  coverImg?: string;

  layers?: LayerDto[];

  project?: ProjectDto;
}
