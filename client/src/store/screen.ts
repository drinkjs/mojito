import { CSSProperties } from 'react';
import { makeAutoObservable, toJS, runInAction, computed } from 'mobx';
import { message, Modal } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import * as service from 'services/screen';
import * as layerService from 'services/layer';
import { loadCDN } from 'components/Loader';
import {
  ComponentStyleQuery,
  LayerInfo,
  LayerQuery,
  ScreenDetailDto,
  ScreenDto
} from 'types';
import { DefaultPageSize } from 'config';

const MAX_UNDO = 100;

interface UpdateHistory {
  action: Function;
  args: any[];
}

export default class Screen {
  screenList: ScreenDto[] = [];

  // 页面明细信息
  screenInfo?: ScreenDetailDto;

  currLayer?: LayerInfo;

  selectedLayerIds: Set<string> = new Set(); // 所有选中的图层id

  getListLoading = false;

  addLoading = false;

  saveLoading = false;

  getDetailLoading = false;

  detailLayersLoading = false;

  resizeing = false;

  undoData: UpdateHistory[] = [];

  redoData: UpdateHistory[] = [];

  constructor () {
    makeAutoObservable(this, {
      layers: computed,
      layerStyle: computed,
      layerGroupRect: computed,
      layerGroup: computed,
      isSelectedGroup: computed,
      isLayerLock: computed,
      isLayerHide: computed
    });
  }

  get layers (): LayerInfo[] {
    return this.screenInfo && this.screenInfo.layers
      ? this.screenInfo.layers
      : [];
  }

  get layerStyle () {
    return this.currLayer ? this.currLayer.style : undefined;
  }

  get layerGroup (): LayerInfo[] {
    const layers = this.layers
      ? this.layers.filter((v) => v.id && this.selectedLayerIds.has(v.id))
      : [];
    return layers;
  }

  get isSelectedGroup () {
    if (this.selectedLayerIds.size < 2) return false;
    // 判断是否选中的图层是在同一个群组，主要用于右上角图标显示状态
    const groupSet = new Set<string>();
    this.layerGroup.forEach((v, index) => {
      groupSet.add(v.group || `${index}`);
    });
    return groupSet.size === 1;
  }

  get layerGroupRect () {
    if (this.layerGroup.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    let maxX = -Number.MAX_VALUE;
    let maxY = -Number.MAX_VALUE;
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    this.layerGroup.forEach((layer) => {
      if (
        layer &&
        layer.style &&
        layer.style.x &&
        layer.style.y &&
        layer.style.width &&
        layer.style.height
      ) {
        minX = Math.min(layer.style.x, minX);
        minY = Math.min(layer.style.y, minY);
        maxX = Math.max(layer.style.x + layer.style.width, maxX);
        maxY = Math.max(layer.style.y + layer.style.height, maxY);
      }
    });
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  get isLayerLock () {
    const layers = this.layerGroup;
    if (layers.length === 0) {
      return false;
    } else if (layers.length === 1) {
      // 只选中一个图层
      return layers[0].isLock;
    } else if (layers.length > 1) {
      if (this.isSelectedGroup) {
        // 选中群组
        return layers[0].groupLock;
      }
      // 多选
      for (const v of layers) {
        if (!v.isLock) return false;
      }
    }
    return true;
  }

  get isLayerHide () {
    const layers = this.layerGroup;
    if (layers.length === 0) {
      // 只选中一个图层
      return false;
    } else if (layers.length === 1) {
      return layers[0].isHide;
    } else if (layers.length > 1) {
      if (this.isSelectedGroup) {
        // 选中群组
        return layers[0].groupHide;
      }
      // 多选
      for (const v of layers) {
        if (!v.isHide) return false;
      }
    }
    return true;
  }

  setCurrLayer (layer: LayerInfo | undefined) {
    runInAction(() => {
      this.currLayer = layer;
    });
  }

  addUndoData (data: UpdateHistory) {
    runInAction(() => {
      this.undoData.push(data);
      if (this.undoData.length >= MAX_UNDO) {
        this.undoData.shift();
      }
    });
  }

  addRedoData (data: UpdateHistory) {
    runInAction(() => {
      this.redoData.push(data);
      if (this.redoData.length >= MAX_UNDO) {
        this.redoData.shift();
      }
    });
  }

  /**
   * 页面列表
   * @param projectId
   */
  async getList (projectId: string) {
    this.getListLoading = true;
    service
      .screenList({ projectId })
      .then((data) => {
        runInAction(() => {
          this.screenList = data;
        });
      })
      .finally(() => {
        runInAction(() => {
          this.getListLoading = false;
        });
      });
  }

  /**
   * 项目名称返回页面列表
   * @param name
   */
  async getListByProjectName (name: string) {
    this.getListLoading = true;
    service
      .screenListByProjectName({ name })
      .then((data) => {
        runInAction(() => {
          this.screenList = data;
        });
      })
      .finally(() => {
        runInAction(() => {
          this.getListLoading = false;
        });
      });
  }

  /**
   * 新增页面
   * @param name
   * @param projectId
   */
  async add (name: string, projectId: string, style?: CSSProperties) {
    this.addLoading = true;
    return service
      .screenAdd({
        name,
        projectId,
        style: {
          width: DefaultPageSize.width, // 页面默认宽度
          height: DefaultPageSize.height, // 页面默认高度
          ...style
        }
      })
      .finally(() => {
        this.addLoading = false;
      });
  }

  /**
   * 编辑页面
   * @param id
   * @param name
   */
  async edit (id: string, name: string, projectId: string, coveImg?: string) {
    this.addLoading = true;
    return service
      .screenUpdate({
        id,
        name,
        projectId,
        coveImg
      })
      .finally(() => {
        this.addLoading = false;
      });
  }

  /**
   * 更新页面封面
   * @param id
   * @param path
   */
  async updateCover (id: string, path: string) {
    return service.updateScreenCover({ id, coverImg: path });
  }

  /**
   * 删除页面
   * @param id
   */
  async remove (id: string) {
    this.addLoading = true;
    return service.screenDelete({ id }).finally(() => {
      this.addLoading = false;
    });
  }

  /**
   * 页面布局详情
   * @param id
   */
  async getDetail (id: string) {
    runInAction(() => {
      this.getDetailLoading = true;
      // 清空上一个页面数据
      this.undoData = [];
      this.redoData = [];
      this.screenList = [];
      this.selectedLayerIds = new Set();
    });
    return service
      .screenDetail({ id })
      .then((data: ScreenDetailDto) => {
        data.layers &&
          data.layers.sort((a, b) => {
            return b.style.z - a.style.z;
          });
        runInAction(() => {
          this.screenInfo = data;
        });
        // 加载项目设置的cdn
        loadCDN(data.project.cdn, () => {
          runInAction(() => {
            this.getDetailLoading = false;
          });
        });
        return data;
      })
      .catch(() => {
        runInAction(() => {
          this.getDetailLoading = false;
        });
      });
  }

  /**
   * 页面样式
   * @param styles
   */
  async saveStyle (styles: any, isUndo?: boolean) {
    if (!this.screenInfo) return;
    const oldStyle = toJS(this.screenInfo.style);
    runInAction(() => {
      if (this.screenInfo) {
        this.screenInfo.style = { ...styles };
      }
    });
    service
      .screenUpdate({
        id: this.screenInfo.id,
        style: styles,
        name: this.screenInfo.name
      })
      .then(() => {
        if (isUndo) {
          this.addRedoData({ args: [oldStyle, false], action: this.saveStyle });
        } else {
          this.addUndoData({ args: [oldStyle, true], action: this.saveStyle });
        }
      })
      .catch(() => {
        this.reload();
      });
  }

  async reload () {
    if (!this.screenInfo) return;
    return service
      .screenDetail({ id: this.screenInfo.id })
      .then((data: ScreenDetailDto) => {
        data.layers &&
          data.layers.sort((a, b) => {
            return b.style.z - a.style.z;
          });
        runInAction(() => {
          this.screenInfo = data;
          this.selectedLayerIds = toJS(this.selectedLayerIds);
        });
        return data;
      });
  }

  /**
   * 组件是否正在操作
   * @param value
   */
  setResizeing (value: boolean) {
    runInAction(() => {
      this.resizeing = value;
    });
  }

  /**
   * 新增图层
   * @param layer
   */
  async addLayer (layer: LayerQuery) {
    return layerService
      .addlayer({ ...layer, component: undefined })
      .then((rel) => {
        // 刷新
        this.addUndoData({ args: [rel, true], action: this.deleteLayer });
        this.reload();
        return rel;
      });
  }

  /**
   * 锁定图层或图层组
   * @param isLock
   */
  lockLayer (isLock: boolean) {
    if (this.selectedLayerIds.size === 1) {
      // 锁定图层
      this.updateLayer(Array.from(this.selectedLayerIds)[0], { isLock });
    } else if (this.selectedLayerIds.size > 1) {
      // 锁定图层组
      const isGroup = this.isSelectedGroup;
      this.batchUpdateLayer(
        Array.from(this.selectedLayerIds).map((id) =>
          isGroup ? { id, groupLock: isLock } : { id, isLock }
        )
      );
    }
  }

  /**
   * 隐藏图层或图层组
   * @param isHide
   */
  hideLayer (isHide: boolean) {
    if (this.selectedLayerIds.size === 1) {
      // 隐藏图层
      this.updateLayer(Array.from(this.selectedLayerIds)[0], { isHide });
    } else if (this.selectedLayerIds.size > 1) {
      // 隐藏图层组
      const isGroup = this.isSelectedGroup;
      this.batchUpdateLayer(
        Array.from(this.selectedLayerIds).map((id) =>
          isGroup ? { id, groupHide: isHide } : { id, isHide }
        )
      );
    }
  }

  /**
   * 更新图层
   * @param layerId
   * @param data
   */
  async updateLayer (
    layerId: string,
    data: LayerQuery,
    reload?: boolean,
    isUndo?: boolean
  ) {
    const keys = Object.keys(data);
    const dataAny: any = data;
    const layerIndex = this.layers.findIndex((v) => v.id === layerId);
    if (layerIndex === -1 || !this.screenInfo || !this.screenInfo.layers) {
      return;
    }

    const undoData: UpdateHistory = {
      args: [layerId, {}, reload, !isUndo],
      action: this.updateLayer
    };
    // 修改本地数据
    const layer: any = this.screenInfo.layers[layerIndex];
    layer.updateTime = new Date();
    if (reload) layer.reloadKey = layer.reloadKey === 1 ? 0 : 1;
    keys.forEach((key) => {
      // 事件不做undo保存，因为实际使中用撤销属性和事件用户可能无感知，很容易产生不可预料的问题
      if (key !== 'events') undoData.args[1][key] = toJS(layer[key]);
      layer[key] = dataAny[key];
    });
    this.screenInfo.layers = [...this.screenInfo.layers]; // 为了刷新右侧图层列表
    this.saveLoading = true;
    // 保存数据
    return layerService
      .updatelayer({
        id: layerId,
        name: layer.name,
        ...data,
        reloadKey: layer.reloadKey
      })
      .then((rel) => {
        // 保存成功
        if (!data.initSize) {
          // 如果有initSize说是新增后的根据组件大小更新的位置
          if (!isUndo) {
            this.addUndoData(undoData);
          } else {
            this.addRedoData(undoData);
          }
        }
        if (reload) {
          this.reload();
        }
        return rel;
      })
      .catch(() => {
        // 保存失败
        runInAction(() => {
          this.selectedLayerIds = new Set();
        });
        this.reload();
      })
      .finally(() => {
        runInAction(() => {
          this.saveLoading = false;
        });
      });
  }

  /**
   * 撤销
   */
  undo () {
    const undoData = this.undoData.pop();
    if (!undoData) return;
    const { args, action } = undoData;
    if (action) {
      runInAction(() => {
        this.selectedLayerIds = new Set();
      });
      action.call(this, ...args);
    }
  }

  /**
   * 重做
   */
  redo () {
    const redoData = this.redoData.pop();
    if (!redoData) return;
    const { args, action } = redoData;
    if (action) {
      runInAction(() => {
        this.selectedLayerIds = new Set();
      });
      action.call(this, ...args);
    }
  }

  sortByLayers () {}

  /**
   * 批量更新图层
   * @param data
   * @param reload
   */
  async batchUpdateLayer (
    data: LayerQuery[],
    reload?: boolean,
    isUndo?: boolean
  ) {
    if (!this.screenInfo || !this.screenInfo.layers) return;

    let isSort = false;
    const undoData = data.map((v: any) => {
      const oldData: any = {};
      const currLayer =
        this.screenInfo &&
        this.screenInfo.layers &&
        this.screenInfo.layers.find((layer) => layer.id === v.id);
      if (currLayer) {
        const currLayerAny: any = currLayer;
        Object.keys(v).forEach((key) => {
          if (key === 'style' && v.style.z !== currLayer.style.z) isSort = true;
          oldData[key] = toJS(currLayerAny[key]);
          currLayerAny[key] = v[key];
        });
      }
      return oldData;
    });

    if (isSort) {
      // 改变z后重新排序
      this.screenInfo.layers.sort((a, b) => {
        return b.style.z - a.style.z;
      });
    }

    this.screenInfo.layers = [...this.screenInfo.layers]; // 为了刷新右侧图层列表

    return layerService
      .batchUpdateLayer(data)
      .then((rel) => {
        if (isUndo) {
          this.addRedoData({
            args: [undoData, reload, false],
            action: this.batchUpdateLayer
          });
        } else {
          this.addUndoData({
            args: [undoData, reload, true],
            action: this.batchUpdateLayer
          });
        }
        if (reload) {
          this.reload();
        }
        return rel;
      })
      .catch(() => {
        runInAction(() => {
          this.selectedLayerIds = new Set();
        });
        this.reload();
      });
  }

  /**
   * 群组图层
   */
  async groupLayer (layerIds: string[], isUndo?: boolean) {
    const group = uuidv4();
    const groups = layerIds.map((id) => {
      return { id, group };
    });

    return layerService
      .batchUpdateLayer(groups)
      .then((rel) => {
        if (isUndo) {
          this.addRedoData({
            args: [layerIds, false],
            action: this.disbandLayer
          });
        } else {
          this.addUndoData({
            args: [layerIds, true],
            action: this.disbandLayer
          });
        }
        if (this.selectedLayerIds.size === 0) {
          this.selectedLayerIds = new Set(layerIds);
        }
        message.success({ content: '群组成功', key: '群组成功' });
        return rel;
      })
      .finally(() => {
        this.reload();
      });
  }

  /**
   * 解除群组
   */
  async disbandLayer (layerIds: string[], isUndo?: boolean) {
    const groups = layerIds.map((id) => {
      return { id, group: '', groupLock: false, groupHide: false };
    });

    return layerService
      .batchUpdateLayer(groups)
      .then((rel) => {
        if (isUndo) {
          this.addRedoData({
            args: [layerIds, false],
            action: this.groupLayer
          });
        } else {
          this.addUndoData({ args: [layerIds, true], action: this.groupLayer });
        }
        if (this.selectedLayerIds.size === 0) {
          this.selectedLayerIds = new Set(layerIds);
        }
        message.success({ content: '解组成功', key: '解组成功' });
        return rel;
      })
      .finally(() => {
        this.reload();
      });
  }

  /**
   * 当前组件样式
   * @param style
   */
  saveLayerStyle (layerId: string, style: ComponentStyleQuery) {
    const layer = this.layers.find((v) => v.id === layerId);
    if (!layer) return;
    const newStyle: any = { ...this.layerStyle, ...style };
    this.updateLayer(layerId, {
      style: newStyle
    });
  }

  /**
   * 强制刷新图层
   */
  reloadLayer () {
    if (this.currLayer) {
      this.updateLayer(this.currLayer.id, {}, true);
    }
  }

  /**
   * 确定删除图层
   * @param layer
   */
  confirmDeleteLayer (layer: LayerInfo) {
    Modal.confirm({
      title: `确定删除${layer.name}?`,
      onOk: () => {
        this.setCurrLayer(undefined);
        this.deleteLayer(layer.id);
      },
      onCancel: () => {}
    });
  }

  /**
   * 删除图层
   * @param layerId
   */
  deleteLayer (layerId: string, isUndo?: boolean) {
    layerService.deletelayer({ id: layerId }).then(() => {
      if (isUndo) {
        this.addRedoData({ action: this.restoreLayer, args: [layerId, false] });
      } else {
        this.addUndoData({ action: this.restoreLayer, args: [layerId, true] });
      }
      runInAction(() => {
        this.selectedLayerIds = new Set();
      });
      this.reload();
    });
  }

  /**
   * 删除恢复
   * @param layerId
   */
  restoreLayer (layerId: string, isUndo?: boolean) {
    layerService.restoreLayer({ id: layerId }).then(() => {
      if (isUndo) {
        this.addRedoData({ action: this.deleteLayer, args: [layerId, false] });
      } else {
        this.addUndoData({ action: this.deleteLayer, args: [layerId, true] });
      }
      this.reload();
    });
  }

  saveAll () {
    const layers = toJS(this.screenInfo?.layers);
    layers && this.batchUpdateLayer(layers, true);
  }
}
