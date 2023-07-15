import * as service from '../services/project';

export default class Project {
  list: ProjectInfo[] = [];

  projectDetail?: ProjectInfo;

  getListLoading = false;

  addLoading = false;

  async getList () {
    this.getListLoading = true;
    const list = await service.getProjectList();
    this.list = list || [];
    this.getListLoading = false;
  }

  /**
   * 新增项目
   * @param name 
   * @returns 
   */
  async add (name: string) {
    this.addLoading = true;
    return service
      .addProject({
        name
      }).then(()=>{
        this.getList();
      })
      .finally(() => {
        this.addLoading = false;
      });
  }

  /**
   * 编辑项目
   * @param id 
   * @param name 
   * @returns 
   */
  async update (id: string, name: string) {
    this.addLoading = true;
    return service
      .updateProject({
        name,
        id
      }).then(()=>{
        this.getList();
      })
      .finally(() => {
        this.addLoading = false;
      });
  }

  /**
   * 删除项目
   * @param id 
   * @returns 
   */
  async remove (id: string) {
    this.addLoading = true;
    return service.delteProject(id).finally(() => {
      this.addLoading = false;
      this.getList();
    });
  }

  /**
   * 项目明细
   * @param id 
   * @returns 
   */
  async detail (id: string) {
    return service.getProjectDetail(id).then((rel) => {
      this.projectDetail = rel;
    });
  }
}
