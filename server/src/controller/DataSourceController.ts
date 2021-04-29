import { Validation } from "src/core";
import { DatasourceDto } from "src/dto";
import { createConnection } from "typeorm";
import { Controller, Post, Body } from "../core/decorator";
import BaseController from "./BaseController";

@Controller("/datasource")
export default class DataSourceController extends BaseController {
  /**
   * 连接数据库
   * @param dto
   */
  @Post("/test")
  async connectTest (
    @Body(new Validation({ groups: ["test"] })) dto: DatasourceDto
  ): PromiseRes<string> {
    const { type, host, port, username, password } = dto;
    try {
      const rel = await createConnection({
        type,
        host,
        port,
        username,
        password,
        // database: "test",
        synchronize: false,
        logging: false,
      });
      if (rel) {
        rel.close();
        return this.success(null);
      }
    } catch (error: any) {
      return this.fail("连接失败");
    }
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
