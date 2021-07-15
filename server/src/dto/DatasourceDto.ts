import { IsMongoId, IsNotEmpty } from "class-validator";

export class DatasourceDto {
  @IsMongoId({ message: "非法id", groups: ["add", "update", "delete"] })
  @IsNotEmpty({
    message: "screenId不能为空",
    groups: ["add", "update", "delete"],
  })
  screenId!: string;

  @IsMongoId({ message: "非法id", groups: ["update", "delete"] })
  @IsNotEmpty({ message: "id不能为空", groups: ["update", "delete"] })
  id?: string;

  @IsNotEmpty({ message: "请选择类型", groups: ["add", "test"] })
  type!: "mysql" | "mariadb";

  @IsNotEmpty({ message: "请输入主机地址", groups: ["add", "test"] })
  host!: string;

  @IsNotEmpty({ message: "请输入端口", groups: ["add", "test"] })
  port!: number;

  @IsNotEmpty({ message: "请输入用户名", groups: ["add", "test"] })
  username!: string;

  password?: string;

  // @IsNotEmpty({ message: "请选择数据库", groups: ["add", "test"] })
  database?: string;
}
