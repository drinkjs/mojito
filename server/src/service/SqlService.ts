import { OrmModelType, OrmModel } from "ngulf";
import ProjectEntity from "../entity/ProjectEntity";

export default class SqlService {
  @OrmModel(ProjectEntity)
  private model: OrmModelType<ProjectEntity>;

  async findAll () {
    const rel = await this.model.find();
    return rel;
  }
}
