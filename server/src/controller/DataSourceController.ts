import { createConnection } from "typeorm";
import { Controller, Post, Body } from "../core/decorator";
import BaseController from "./BaseController";
import { DataBaseConnectDto } from "src/dto/DataBaseConnectDto";

@Controller("/datasource")
export default class DataSourceController extends BaseController {
  /**
   * 连接数据库
   * @param dto
   */
  @Post("/connect/test")
  async connectTest (@Body() dto: DataBaseConnectDto): PromiseRes<string> {
    const rel = await createConnection({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "",
      database: "test",
      synchronize: false,
      logging: false,
    });

    rel.close();

    console.log("------------------------------------", rel);

    return this.fail("添加失败");
  }

  /**
   * 连接数据库
   * @param dto
   */
  @Post("/connect")
  async connect (): PromiseRes<string> {
    const rel = await createConnection({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "",
      database: "test",
      synchronize: false,
      logging: false,
    });

    console.log("------------------------------------", rel);

    return this.fail("添加失败");
  }

  /**
   * 连接数据库
   * @param dto
   */
  @Post("/query")
  async query (@Body("query") queryStr: string): PromiseRes<string> {
    const rel = await createConnection({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "",
      database: "test",
      synchronize: false,
      logging: false,
    });

    console.log("------------------------------------", rel);

    return this.fail("添加失败");
  }
}
