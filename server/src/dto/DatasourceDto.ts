import { IsMongoId, IsNotEmpty } from "class-validator";

export class DatasourceDto {
  @IsMongoId({ message: "非法id", groups: ["add"] })
  @IsNotEmpty({ message: "请选择类型", groups: ["add"] })
  screenId: string;

  id?: string;

  @IsNotEmpty({ message: "请选择类型", groups: ["add", "test"] })
  type: "mysql" | "mariadb";

  @IsNotEmpty({ message: "请输入主机地址", groups: ["add", "test"] })
  host: string;

  @IsNotEmpty({ message: "请输入端口", groups: ["add", "test"] })
  port: number;

  @IsNotEmpty({ message: "请输入用户名", groups: ["add", "test"] })
  username: string;

  password?: string;

  // @IsNotEmpty({ message: "请选择数据库", groups: ["add", "test"] })
  database?: string;
}
