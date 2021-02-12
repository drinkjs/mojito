import { IsNotEmpty } from "class-validator";
import { IsObjectId } from "common/Mongoer";
import { ScreenOptions } from "entity/ScreenEntity";
import { LayerDto } from "./LayerDto";
import { ProjectDto } from "./ProjectDto";

export class ScreenDto {
  @IsObjectId({ message: "非法id", groups: ["add"] })
  @IsNotEmpty({ message: "请输入项目id", groups: ["add"] })
  projectId: string;

  @IsObjectId({ message: "非法id", groups: ["update", "coverImg"] })
  @IsNotEmpty({ message: "请输入页面id", groups: ["update", "coverImg"] })
  id: string;

  @IsNotEmpty({ message: "请输入项目名称", groups: ["add", "update"] })
  name: string;

  options?: ScreenOptions;

  createUser?: string;

  createTime?: string;

  @IsNotEmpty({ message: "请上传封面图片", groups: ["coverImg"] })
  coverImg?: string;

  layers?: LayerDto[];

  project?: ProjectDto;
}
