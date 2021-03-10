import { CSSProperties } from 'react';
import { makeAutoObservable, toJS, runInAction, computed } from 'mobx';
import { Modal } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import Moveable from 'react-moveable';
import * as service from 'services/screen';
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
export default class Screen {
  moveable: Moveable | undefined;

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

  undoData: ScreenDetailDto[] = [];

  redoData: ScreenDetailDto[] = [];

  constructor () {
    makeAutoObservable(this, {
      layers: computed,
      layerStyle: computed,
      layerGroupRect: computed,
      layerGroup: computed,
      isSelectedGroup: computed,
      isLayerLock: computed,
      isLayerHide: computed,
      moveable: false
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
      return layers[0].lock;
    } else if (layers.length > 1) {
      if (this.isSelectedGroup) {
        // 选中群组
        return layers[0].groupLock;
      }
      // 多选
      for (const v of layers) {
        if (!v.lock) return false;
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
      return layers[0].hide;
    } else if (layers.length > 1) {
      if (this.isSelectedGroup) {
        // 选中群组
        return layers[0].groupHide;
      }
      // 多选
      for (const v of layers) {
        if (!v.hide) return false;
      }
    }
    return true;
  }

  setCurrLayer (layer: LayerInfo | undefined) {
    runInAction(() => {
      this.currLayer = layer;
    });
  }

  /**
   * undo数据
   * @param data
   * @returns
   */
  addUndoData (data?: ScreenDetailDto) {
    if (!data) return;
    runInAction(() => {
      this.undoData.push(toJS(data));
      if (this.undoData.length >= MAX_UNDO) {
        this.undoData.shift();
      }
    });
  }

  /**
   * redo数据
   * @param data
   * @returns
   */
  addRedoData (data?: ScreenDetailDto) {
    if (!data) return;
    runInAction(() => {
      this.redoData.push(toJS(data));
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
   * 保存页面信息
   */
  async saveScreen () {
    if (!this.screenInfo || this.saveLoading) return;
    this.saveLoading = true;
    return service
      .updateLayer({
        id: this.screenInfo.id,
        layers: this.screenInfo.layers,
        style: this.screenInfo.style
      })
      .then(() => {
        return true;
      })
      .finally(() => {
        runInAction(() => {
          this.saveLoading = false;
        });
      })
      .catch(() => {
        this.reload();
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

        // 加载项目设置的cdn
        loadCDN(data.project.cdn, () => {
          runInAction(() => {
            this.screenInfo = data;
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
  async saveStyle (styles: any) {
    if (!this.screenInfo) return;
    this.addUndoData(this.screenInfo);
    this.screenInfo.style = { ...styles };
  }

  /**
   * 重新加载页面图层
   */
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
  async addLayer (layer: LayerInfo) {
    if (!this.screenInfo) return;
    this.addUndoData(this.screenInfo);
    const layers = this.screenInfo?.layers || [];
    layers.unshift({ ...layer, updateFlag: new Date().getTime() });
    this.screenInfo.layers = toJS(layers);
  }

  /**
   * 锁定图层或图层组
   * @param lock
   */
  lockLayer (lock: boolean) {
    if (this.selectedLayerIds.size === 1) {
      // 锁定图层
      this.updateLayer(Array.from(this.selectedLayerIds)[0], { lock });
    } else if (this.selectedLayerIds.size > 1) {
      // 锁定图层组
      const isGroup = this.isSelectedGroup;
      this.batchUpdateLayer(
        Array.from(this.selectedLayerIds).map((id) =>
          isGroup ? { id, groupLock: lock } : { id, lock }
        )
      );
    }
  }

  /**
   * 隐藏图层或图层组
   * @param hide
   */
  hideLayer (hide: boolean) {
    if (this.selectedLayerIds.size === 1) {
      // 隐藏图层
      this.updateLayer(Array.from(this.selectedLayerIds)[0], { hide });
    } else if (this.selectedLayerIds.size > 1) {
      // 隐藏图层组
      const isGroup = this.isSelectedGroup;
      this.batchUpdateLayer(
        Array.from(this.selectedLayerIds).map((id) =>
          isGroup ? { id, groupHide: hide } : { id, hide }
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
    opts?: { reload?: boolean; saveNow?: boolean }
  ) {
    const keys = Object.keys(data);
    const dataAny: any = data;
    const layerIndex = this.layers.findIndex((v) => v.id === layerId);
    if (layerIndex === -1 || !this.screenInfo || !this.screenInfo.layers) {
      return;
    }

    if (!data.initSize) {
      // 如果initSize为true说明是刚新增的组件初始化大小，这是一个非用户操作不需要保存
      this.addUndoData(this.screenInfo);
    }
    // 修改本地数据
    const layer: LayerInfo = this.screenInfo.layers[layerIndex];
    layer.updateFlag = new Date().getTime();

    keys.forEach((key) => {
      const layerAny: any = layer;
      layerAny[key] = dataAny[key];
    });

    if (opts?.reload) {
      layer.reloadKey = layer.reloadKey === 1 ? 0 : 1;
    }

    this.screenInfo.layers = [...this.screenInfo.layers];
    this.selectedLayerIds = toJS(this.selectedLayerIds);

    if (opts?.saveNow) {
      return this.saveScreen();
    }
  }

  /**
   * 撤销
   */
  undo () {
    const undoData = this.undoData.pop();
    if (!undoData) return;
    this.screenInfo = undoData;
    this.selectedLayerIds = toJS(this.selectedLayerIds);
    this.addRedoData(undoData);
  }

  /**
   * 重做
   */
  redo () {
    const redoData = this.redoData.pop();
    if (!redoData) return;
    this.screenInfo = redoData;
    this.selectedLayerIds = toJS(this.selectedLayerIds);
    this.addUndoData(redoData);
  }

  /**
   * 批量更新图层
   * @param data
   * @param reload
   */
  async batchUpdateLayer (data: LayerQuery[], saveNow?: boolean) {
    if (!this.screenInfo || !this.screenInfo.layers) return;

    this.addUndoData(this.screenInfo);

    let isSort = false;
    data.forEach((v: any) => {
      const currLayer = this.screenInfo?.layers?.find(
        (layer) => layer.id === v.id
      );
      if (currLayer) {
        currLayer.updateFlag = new Date().getTime();
        const currLayerAny: any = currLayer;
        Object.keys(v).forEach((key) => {
          if (key === 'style' && v.style.z !== currLayer.style.z) isSort = true;
          currLayerAny[key] = v[key];
        });
      }
    });

    if (isSort) {
      // 改变z后重新排序
      this.screenInfo.layers.sort((a, b) => {
        return b.style.z - a.style.z;
      });
    }

    this.screenInfo.layers = [...this.screenInfo.layers];
    this.selectedLayerIds = toJS(this.selectedLayerIds);
    if (saveNow) {
      this.saveScreen();
    }
  }

  /**
   * 群组图层
   */
  async groupLayer (layerIds: string[]) {
    const group = uuidv4();
    const groups = layerIds.map((id) => {
      return { id, group };
    });

    return this.batchUpdateLayer(groups);
  }

  /**
   * 解除群组
   */
  async disbandLayer (layerIds: string[]) {
    const groups = layerIds.map((id) => {
      return { id, group: '', groupLock: false, groupHide: false };
    });
    return this.batchUpdateLayer(groups);
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
      this.updateLayer(this.currLayer.id, {}, { reload: true });
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
  deleteLayer (layerId: string) {
    this.addUndoData(this.screenInfo);
    if (this.screenInfo?.layers) {
      this.screenInfo.layers = this.screenInfo.layers.filter(
        (v) => v.id !== layerId
      );
    }
  }
}
