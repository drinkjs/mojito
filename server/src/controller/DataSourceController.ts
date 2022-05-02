import { DatasourceDto } from "../dto";
import { Controller, Post, Body, BaseController, Validation } from "ngulf";

@Controller("/datasource")
export default class DataSourceController extends BaseController {
  /**
   * 连接数据库
   * @param dto
   */
  @Post("/test")
  async connectTest (
    @Body(new Validation({ groups: ["test"] })) dto: DatasourceDto
  ) {
    // const { type, host, port, username, password } = dto;
    // try {
    //   const rel = await createConnection({
    //     type,
    //     host,
    //     port,
    //     username,
    //     password,
    //     // database: "test",
    //     synchronize: false,
    //     logging: false,
    //   });
    //   if (rel) {
    //     rel.close();
    //     return this.success(null);
    //   }
    // } catch (error: any) {
    //   return this.fail("连接失败");
    // }
  }
}
