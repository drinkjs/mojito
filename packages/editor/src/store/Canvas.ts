import * as service from "@/services/screen";
import { makeObservable } from "fertile";
import { v4 as uuidv4 } from "uuid";
import "systemjs";
import { message } from "antd";
import { getPackDetail } from "@/services/component";
import { getPackScriptUrl } from "@/common/util";

const MAX_UNDO = 100;

export default class Canvas {
	// 画面内容信息
	screenInfo?: ScreenDetail;
	// 当前选中的图层
	currLayer?: LayerInfo;
	// 当前选中所有图层的id，可以多选
	selectedLayerIds: Set<string> = new Set(); // 所有选中的图层id
	// 是否正在保存
	saveLoading = false;
	getDetailLoading = false;
	detailLayersLoading = false;
	resizeing = false;
	// 图层在执行动画
	playing = false;
	undoData: ScreenDetail[] = [];
	redoData: ScreenDetail[] = [];
	scale = 1;
	moveableRect:
		| { x: number; y: number; width: number; height: number }
		| undefined;

	rootElement: HTMLDivElement | null = null;
	areaElement: HTMLDivElement | null = null;
	zoomElement: HTMLDivElement | null = null;

	// 通过组件库id快速获取组件库加载地址和依赖
	packScript: Map<
		string,
		{ scriptUrl: string; external?: Record<string, string> }
	> = new Map();
  // 已经加载过的组件
	loadedPackComponent: Map<string, Record<string, MojitoComponent>> = new Map();

	constructor() {
		makeObservable(this, {
			areaElement: false,
			zoomElement: false,
			packScript: false,
      loadedPackComponent:false
		});
	}
	/**
	 * 页面布局详情
	 * @param id
	 */
	async getDetail(id: string) {
		this.getDetailLoading = true;
		// 清空上一个页面数据
		this.undoData = [];
		this.redoData = [];
		this.screenInfo = undefined;
		this.selectedLayerIds = new Set();

		return service
			.getScreenDetail(id)
			.then((data) => {
				this.screenInfo = data;
				return data;
			})
			.catch((e) => {
				console.error(e);
				this.getDetailLoading = false;
			});
	}

	get layers(): LayerInfo[] {
		return this.screenInfo && this.screenInfo.layers
			? this.screenInfo.layers
			: [];
	}

	get layerStyle() {
		return this.currLayer ? this.currLayer.style : undefined;
	}

	get layerGroup(): LayerInfo[] {
		const layers = this.layers
			? this.layers.filter((v) => v.id && this.selectedLayerIds.has(v.id))
			: [];
		return layers;
	}

	get isSelectedGroup() {
		if (this.selectedLayerIds.size < 2) return false;
		// 判断是否选中的图层是在同一个群组，主要用于右上角图标显示状态
		const groupSet = new Set<string>();
		this.layerGroup.forEach((v, index) => {
			groupSet.add(v.group || `${index}`);
		});
		return groupSet.size === 1;
	}

	get isLayerLock() {
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

	get isLayerHide() {
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

	setCurrLayer(layer: LayerInfo | undefined) {
		this.currLayer = layer;
	}

	/**
	 * undo数据
	 * @param data
	 * @returns
	 */
	addUndoData(data?: ScreenDetail) {
		if (!data) return;
		this.undoData.push(data);
		if (this.undoData.length >= MAX_UNDO) {
			this.undoData.shift();
		}
	}

	/**
	 * redo数据
	 * @param data
	 * @returns
	 */
	addRedoData(data?: ScreenDetail) {
		if (!data) return;
		this.redoData.push(data);
		if (this.redoData.length >= MAX_UNDO) {
			this.redoData.shift();
		}
	}

	/**
	 * 保存页面信息
	 */
	async saveScreen() {
		if (!this.screenInfo || this.saveLoading) return;
		this.saveLoading = true;
		return service
			.updateLayer({
				id: this.screenInfo.id,
				layers: this.screenInfo.layers?.map((layer) => ({
					...layer,
					component: layer?.component ? { id: layer.component?.id } : undefined,
				})),
				style: this.screenInfo.style,
			})
			.then(() => {
				return true;
			})
			.finally(() => {
				this.saveLoading = false;
			})
			.catch(() => {
				this.reload();
			});
	}

	async getDetailByName(projectName: string, screenName: string) {
		this.getDetailLoading = true;
		// 清空上一个页面数据
		this.undoData = [];
		this.redoData = [];
		this.screenInfo = undefined;
		this.selectedLayerIds = new Set();

		return service
			.getScreenDetailByName(projectName, screenName)
			.then((data) => {
				if (data) {
					// this.loadScript(data);
				}
				return data;
			})
			.catch((e) => {
				console.error(e);
				this.getDetailLoading = false;
			});
	}

	/**
	 * 页面样式
	 * @param styles
	 */
	async saveStyle(styles: ScreenStyle) {
		if (!this.screenInfo) return;
		this.addUndoData(this.screenInfo);
		this.screenInfo.style = { ...styles };
	}

	/**
	 * 重新加载页面图层
	 */
	async reload() {
		if (!this.screenInfo) return;
		return service.getScreenDetail(this.screenInfo.id).then((data) => {
			if (data) {
				data.layers &&
					data.layers.sort((a, b) => {
						return b.style.z - a.style.z;
					});
			}
			this.screenInfo = data;
			this.selectedLayerIds = new Set(this.selectedLayerIds);
			return data;
		});
	}

	/**
	 * 组件是否正在操作
	 * @param value
	 */
	setResizeing(value: boolean) {
		this.resizeing = value;
	}

	/**
	 * 新增图层
	 * @param layer
	 */
	async addLayer(
		layer: LayerInfo,
		scriptUrl: string,
		external?: Record<string, string>
	) {
		if (!this.screenInfo) return;

		if (!this.screenInfo.layers) {
			this.screenInfo.layers = [];
		}
		this.screenInfo.layers.push(layer);
		// 缓存组件库加载信息
		if (!this.packScript.has(layer.component.packId)) {
			this.packScript.set(layer.component.packId, { scriptUrl, external });
		}
		// 更新ui
		this.screenInfo = { ...this.screenInfo };
	}

	/**
	 * 加载组件
	 * @param packId
   * @param exportName
	 */
	async loadComponent(packId: string, exportName: string):Promise<MojitoComponent | undefined>{
		const loaded = this.loadedPackComponent.get(packId);
		if (loaded && loaded[exportName]) {
			return loaded[exportName];
		}

		let packInfo = this.packScript.get(packId);
		if (!packInfo) {
			// 调用接口获取信息
      const rel = await getPackDetail(packId);
      if(!rel){
        message.error("没有相关组件");
        return;
      }
      // 获取组件库脚本地址
      const scriptUrl = getPackScriptUrl(rel.packUrl, rel.name);
      packInfo = {
        scriptUrl,
        external: rel.external
      }
      // 缓存组件库信息
      this.packScript.set(packId, packInfo);
		}

		if (packInfo?.external) {
      // 加载依赖
			System.addImportMap({
				imports: packInfo.external,
			});
		}

		if (packInfo?.scriptUrl) {
      // 加载组件库脚本
      const components = await System.import(packInfo.scriptUrl).catch((e:Error) => {
        message.error(e.message);
        console.error(e);
      });
      console.log("Load script", components);
      if(components && components[exportName] && typeof components[exportName] === "function"){
        // 获取组件
        const comp = await components[exportName]().catch((e:Error) => {
          message.error(e.message);
          console.error(e);
        });
        console.log(`Load ${exportName}`, comp);
        if(comp){
          this.loadedPackComponent.set(packId, {...loaded, [exportName]: comp});
          return comp;
        }
      }
		}
	}

	/**
	 * 锁定图层或图层组
	 * @param lock
	 */
	lockLayer(lock: boolean) {
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
	hideLayer(hide: boolean) {
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
	async updateLayer(
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
		this.selectedLayerIds = new Set(this.selectedLayerIds);

		if (opts?.saveNow) {
			return this.saveScreen();
		}
	}

	/**
	 * 撤销
	 */
	undo() {
		const undoData = this.undoData.pop();
		if (!undoData) return;
		this.addRedoData(this.screenInfo);
		this.screenInfo = undoData;
		this.selectedLayerIds = new Set(this.selectedLayerIds);
	}

	/**
	 * 重做
	 */
	redo() {
		const redoData = this.redoData.pop();
		if (!redoData) return;
		this.addUndoData(this.screenInfo);
		this.screenInfo = redoData;
		this.selectedLayerIds = new Set(this.selectedLayerIds);
	}

	/**
	 * 批量更新图层
	 * @param data
	 * @param reload
	 */
	async batchUpdateLayer(data: LayerQuery[], saveNow?: boolean) {
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
					if (key === "style" && v.style.z !== currLayer.style.z) isSort = true;
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
		this.selectedLayerIds = new Set(this.selectedLayerIds);
		if (saveNow) {
			this.saveScreen();
		}
	}

	/**
	 * 群组图层
	 */
	async groupLayer(layerIds: string[]) {
		const group = uuidv4();
		const groups = layerIds.map((id) => {
			return { id, group };
		});

		return this.batchUpdateLayer(groups);
	}

	/**
	 * 解除群组
	 */
	async disbandLayer(layerIds: string[]) {
		const groups = layerIds.map((id) => {
			return { id, group: "", groupLock: false, groupHide: false };
		});
		return this.batchUpdateLayer(groups);
	}

	/**
	 * 当前组件样式
	 * @param style
	 */
	saveLayerStyle(layerId: string, style: ComponentStyleQuery) {
		const layer = this.layers.find((v) => v.id === layerId);
		if (!layer) return;
		const newStyle: any = { ...this.layerStyle, ...style };
		this.updateLayer(layerId, {
			style: newStyle,
		});
	}

	/**
	 * 强制刷新图层
	 */
	reloadLayer() {
		if (this.currLayer) {
			this.updateLayer(this.currLayer.id, {}, { reload: true });
		}
	}

	/**
	 * 确定删除图层
	 * @param layer
	 */
	// confirmDeleteLayer (layer: LayerInfo) {
	//   Modal.confirm({
	//     title: `确定删除${layer.name}?`,
	//     onOk: () => {
	//       this.setCurrLayer(undefined);
	//       this.deleteLayer(layer.id);
	//     },
	//     onCancel: () => {}
	//   });
	// }

	/**
	 * 删除图层
	 * @param layerId
	 */
	deleteLayer(layerId: string) {
		this.addUndoData(this.screenInfo);
		if (this.screenInfo?.layers) {
			this.screenInfo.layers = this.screenInfo.layers.filter(
				(v) => v.id !== layerId
			);
		}
	}

	/**
	 * 新增数据源连接
	 * @param dto
	 * @returns
	 */
	addDatasource(dto: DatasourceInfo) {
		return service.addDatasource({
			screenId: this.screenInfo!.id,
			...dto,
		});
	}

	/**
	 * 新增数据源连接
	 * @param dto
	 * @returns
	 */
	delDatasource(id: string) {
		return service.delDatasource({
			screenId: this.screenInfo!.id,
			id,
		});
	}
}
