import { makeAutoObservable, runInAction } from 'mobx';
import * as service from 'services/component';
import { ComponentInfo, ComponentTypeTree } from 'types';

export default class Component {
  typeTree: ComponentTypeTree[] = [];

  typeComponent: ComponentInfo[] = [];

  systemComponent: ComponentInfo[] = [];

  componentInfo: ComponentInfo | null = null;

  getTypeTreeLoading = false;

  getComponentInfoLoading = false;

  addLoading = false;

  currSelectType: number | null = null;

  constructor () {
    makeAutoObservable(this);
  }

  /**
   * 组件类树
   */
  async getTypeTree () {
    if (this.typeTree && this.typeTree.length > 0) return;
    this.getTypeTreeLoading = true;
    service
      .getTypeTree()
      .then((data) => {
        runInAction(() => {
          this.typeTree = data;
        });
      })
      .finally(() => {
        runInAction(() => {
          this.getTypeTreeLoading = false;
        });
      });
  }

  /**
   * 增加组件
   * @param params
   */
  async addComponent (params: ComponentInfo) {
    this.addLoading = true;
    return service
      .addComponent(params)
      .then((data) => {
        return data;
      })
      .finally(() => {
        runInAction(() => {
          this.addLoading = false;
        });
      });
  }

  /**
   * 更新组件
   * @param params
   */
  async updateComponent (params: ComponentInfo) {
    this.addLoading = true;
    return service
      .updateComponent(params)
      .then((data) => {
        return data;
      })
      .finally(() => {
        runInAction(() => {
          this.addLoading = false;
        });
      });
  }

  /**
   * 增加系统组件
   * @param params
   */
  async addSystemComponent (params: any) {
    this.addLoading = true;
    return service
      .addSystemComponent(params)
      .then((data) => {
        return data;
      })
      .finally(() => {
        runInAction(() => {
          this.addLoading = false;
        });
      });
  }

  /**
   * 某种类型下的组件
   * @param type
   */
  async getTypeComponent (type: number | undefined) {
    if (!type) return;
    this.getTypeTreeLoading = true;
    this.currSelectType = type;
    return service
      .getTypeComponent({ type })
      .then((data) => {
        runInAction(() => {
          this.typeComponent = data;
        });
      })
      .finally(() => {
        runInAction(() => {
          this.getTypeTreeLoading = false;
        });
      });
  }

  /**
   * 组件详情
   * @param id
   */
  async getComponentInfo (id: string) {
    this.getComponentInfoLoading = true;
    return service
      .getComponentInfo({ id })
      .then((data) => {
        runInAction(() => {
          this.componentInfo = data;
        });
      })
      .finally(() => {
        runInAction(() => {
          this.getComponentInfoLoading = false;
        });
      });
  }

  /**
   * 系统组件
   * @param id
   */
  async getComponentSystem () {
    this.getComponentInfoLoading = true;
    return service
      .getComponentBySystem()
      .then((data) => {
        runInAction(() => {
          this.systemComponent = data;
        });
      })
      .finally(() => {
        runInAction(() => {
          this.getComponentInfoLoading = false;
        });
      });
  }

  /**
   * 系统组件
   * @param id
   */
  async removeComponent (id: string | undefined) {
    return service.removeComponent({ id });
  }
}
