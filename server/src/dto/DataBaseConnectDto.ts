import { IsNotEmpty } from "class-validator";

export class DataBaseConnectDto {
  @IsNotEmpty({ message: "请选择项目" })
  projectId: string;

  @IsNotEmpty({ message: "请输入数据源类型" })
  type: string;

  @IsNotEmpty({ message: "请输入数据源地址" })
  host: string;

  @IsNotEmpty({ message: "请输入数据源端口" })
  port: number;

  @IsNotEmpty({ message: "请输入数据库用户名" })
  username?: string;

  password?: string;

  @IsNotEmpty({ message: "请输入数据源库名称" })
  database: string;
}
