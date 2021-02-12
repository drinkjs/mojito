import { makeAutoObservable, runInAction } from "mobx";
import * as service from "services/project";
import { ProjectDto } from "types";

export default class Project {
  projectList: ProjectDto[] = [];

  projectDetail: ProjectDto | undefined;

  getListLoading = false;

  addLoading = false;

  constructor () {
    makeAutoObservable(this);
  }

  async getList () {
    this.getListLoading = true;
    return service
      .projectList()
      .then((data) => {
        runInAction(() => {
          this.projectList = data;
        });
        return data;
      })
      .finally(() => {
        runInAction(() => {
          this.getListLoading = false;
        });
      });
  }

  async add (name: string) {
    this.addLoading = true;
    return service
      .projectAdd({
        name
      })
      .finally(() => {
        runInAction(() => {
          this.addLoading = false;
        });
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
        runInAction(() => {
          this.addLoading = false;
        });
      });
  }

  async updateCDN (id: string, cdn: string[]) {
    this.addLoading = true;
    return service
      .projectUpdateCDN({
        cdn,
        id
      })
      .finally(() => {
        runInAction(() => {
          this.addLoading = false;
        });
      });
  }

  async remove (id: string) {
    this.addLoading = true;
    return service.projectDelete({ id }).finally(() => {
      runInAction(() => {
        this.addLoading = false;
      });
    });
  }

  async detail (id: string) {
    return service.projectDetail({ id }).then((rel) => {
      runInAction(() => {
        this.projectDetail = rel;
      });
    });
  }
}
