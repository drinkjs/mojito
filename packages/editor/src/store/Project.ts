import * as service from '../services/project';

export default class Project {
  projectList: ProjectInfo[] = [];

  projectDetail?: ProjectInfo;

  getListLoading = false;

  addLoading = false;

  async getList () {
    this.getListLoading = true;
    const list = await service.getProjectList();
    this.projectList = list || [];
    this.getListLoading = false;
  }

  async add (name: string) {
    this.addLoading = true;
    return service
      .projectAdd({
        name
      })
      .finally(() => {
        this.addLoading = false;
      });
  }

  async edit (id: string, name: string) {
    this.addLoading = true;
    return service
      .projectUpdate({
        name,
        id
      })
      .finally(() => {
        this.addLoading = false;
      });
  }

  async remove (id: string) {
    this.addLoading = true;
    return service.projectDelete(id).finally(() => {
      this.addLoading = false;
    });
  }

  async detail (id: string) {
    return service.getProjectDetail(id).then((rel) => {
      this.projectDetail = rel;
    });
  }
}
