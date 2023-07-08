import Message from 'components/Message';
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

  addTypeLoading = false;

  currSelectType: string | null = null;

  constructor () {
    makeAutoObservable(this);
  }

  /**
   * 组件类树
   */
  async getTypeTree () {
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
   * 添加分类
   * @param data
   * @returns
   */
  async addType (data: ComponentTypeTree) {
    this.addTypeLoading = true;
    return service
      .addType(data)
      .then(() => {
        Message.success('添加成功');
        this.getTypeTree();
      })
      .finally(() => {
        runInAction(() => {
          this.addTypeLoading = false;
        });
      });
  }

  /**
   * 添加分类
   * @param data
   * @returns
   */
  async removeType (id: string) {
    this.addTypeLoading = true;
    return service
      .removeType(id)
      .then(() => {
        Message.success('删除成功');
        this.getTypeTree();
      })
      .finally(() => {
        runInAction(() => {
          this.addTypeLoading = false;
        });
      });
  }

  /**
   * 更新分类
   * @param data
   * @returns
   */
  async updateType (data: ComponentTypeTree) {
    this.addTypeLoading = true;
    return service
      .updateType(data)
      .then(() => {
        Message.success('更新成功');
        this.getTypeTree();
      })
      .finally(() => {
        runInAction(() => {
          this.addTypeLoading = false;
        });
      });
  }

  /**
   * 增加组件
   * @param params
   */
  async addComponent (params: ComponentInfo) {
    this.addTypeLoading = true;
    return service
      .addComponent(params)
      .then((data) => {
        return data;
      })
      .finally(() => {
        runInAction(() => {
          this.addTypeLoading = false;
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
   * 某种类型下的组件
   * @param type
   */
  async getTypeComponent (type: string | undefined) {
    if (!type) return;
    this.getTypeTreeLoading = true;
    this.currSelectType = type;
    return service
      .getTypeComponent(type)
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
      .getComponentInfo(id)
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
  async removeComponent (id: string) {
    return service.removeComponent(id);
  }
}
