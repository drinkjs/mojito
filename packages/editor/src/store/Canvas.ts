import * as service from "@/services/screen";
import { makeObservable } from "fertile";
import _ from "lodash-es";
import "systemjs";
import { message } from "antd";
import { getPackDetail } from "@/services/component";
import { getPackScriptUrl, smallId } from "@/common/util";
import { RectInfo } from "react-moveable";

const MAX_UNDO = 100;

export default class Canvas {
	// 画布信息
	screenInfo?: ScreenDetail;
	// 图层
	layers: LayerInfo[] = [];
	// 当前选中所有图层的id，可以多选
	selectedLayers: Set<LayerInfo> = new Set(); // 所有选中的图层id

	saveLoading = false;
	getDetailLoading = false;

	undoData: ScreenDetail[] = [];
	redoData: ScreenDetail[] = [];
	scale = 1;
	// 强制刷新组件
	reloadLayerIds: string[] = [];

	moveableRect?: RectInfo;
	layoutContainer: HTMLDivElement | null = null;
	areaElement: HTMLDivElement | null = null;
	zoomElement: HTMLDivElement | null = null;

	mouseDownEvent?: React.MouseEvent<HTMLDivElement, MouseEvent>;

	// 缓存组件库加载地址和依赖
	packScriptMap: Map<
		string,
		{ scriptUrl: string; external?: Record<string, string>} | Promise<ComponentPackInfo | undefined>
	> = new Map();
	// 已经加载过的组件
	loadedPackComponent: Map<
		string,
		Record<string, Constructor<MojitoComponent>>
	> = new Map();
	// 图层应该的dom节点
	layerDomCache: Map<string, HTMLDivElement> = new Map();

	constructor() {
		makeObservable(this, {
			layoutContainer: false,
			areaElement: false,
			zoomElement: false,
			packScriptMap: false,
			loadedPackComponent: false,
			mouseDownEvent: false,
			layerDomCache: false,
			moveableRect: false,
			saveLoading: false,
			undoData: false,
			redoData: false,
		});
	}

	get isAllLock() {
		for (const layer of this.selectedLayers) {
			if (!layer.lock) {
				return false;
			}
		}
		return true;
	}

	get isAllHide() {
		for (const layer of this.selectedLayers) {
			if (!layer.hide) {
				return false;
			}
		}
		return true;
	}

	get isAllGroup() {
		const groups = new Set();
		for (const layer of this.selectedLayers) {
			if (layer.group) {
				groups.add(layer.group);
			} else {
				return false;
			}
		}
		return groups.size === 1;
	}

	/**
	 * undo数据
	 * @param data
	 * @returns
	 */
	private addUndoData(data?: ScreenDetail) {
		this.undoData.push(_.cloneDeep(data || this.screenInfo! ));
		if (this.undoData.length >= MAX_UNDO) {
			this.undoData.shift();
		}
	}

	/**
	 * redo数据
	 * @param data
	 * @returns
	 */
	private addRedoData(data?: ScreenDetail) {
		this.redoData.push(_.cloneDeep(data || this.screenInfo!));
		if (this.redoData.length >= MAX_UNDO) {
			this.redoData.shift();
		}
	}

	/**
	 * 取消选中图层
	 */
	cancelSelect(){
		this.selectedLayers = new Set()
	}

	/**
	 * 缓存layer dom
	 * @param layerId
	 * @param element
	 */
	cacheLayerDom(layerId: string, element: HTMLDivElement) {
		this.layerDomCache.set(layerId, element);
	}

	/**
	 * 在缓存里取出图层dom
	 * @param layerId
	 * @returns
	 */
	getLayerDom(layerId: string) {
		return this.layerDomCache.get(layerId);
	}

	/**
	 * 页面布局详情
	 * @param id
	 */
	async getDetail(id: string) {
		this.getDetailLoading = true;
		const data = await service.getScreenDetail(id);
		if (data) {
			this.screenInfo = data;
			this.layers = this.screenInfo.layers || [];
			let packIds = this.layers.map(v => v.component.packId);
			packIds = Array.from(new Set(packIds));
			if(packIds.length){
				// 获取组件的依赖信息
				const packs = (await getPackDetail(packIds)) as ComponentPackInfo[];
				if(packs){
					packs.forEach(rel =>{
						// 缓存依赖信息
						const scriptUrl = getPackScriptUrl(rel.packUrl, rel.name);
						this.packScriptMap.set(rel.id, {scriptUrl, external: rel.external})
					});
				}
			}
		}else{
			this.screenInfo = undefined;
			this.layers = [];
		}
		this.getDetailLoading = false;
	}

	/**
	 * 刷新图层数据，强制刷新ui
	 * @param layerIds
	 */
	refreshLayer(layerIds?: string[]) {
		if (layerIds) {
			layerIds.forEach((layerId) => {
				const layerIndex = this.layers.findIndex((v) => v.id === layerId);
				if (layerIndex !== -1) {
					const layer = this.layers[layerIndex];
					this.layers[layerIndex] = { ...layer };
				}
				this.layers = [...this.layers];
			});
		} else {
			this.layers = this.layers.map((v) => ({ ...v }));
		}

		this.screenInfo!.layers = this.layers;

		if (this.selectedLayers.size > 0) {
			const newSelect: Set<LayerInfo> = new Set();
			this.selectedLayers.forEach((layer) => {
				const selectLayer = this.layers.find((v) => v.id === layer.id);
				if (selectLayer) {
					newSelect.add(selectLayer);
				}
			});
			this.selectedLayers = newSelect;
		}
	}

	/**
	 * 选中图层
	 * @param layer
	 * @param isMultiple
	 */
	selectLayer(layer: LayerInfo, isMultiple?: boolean) {
		if (this.selectedLayers.has(layer)) return;

		if (!isMultiple) {
			this.selectedLayers.clear();
		}
		this.selectedLayers.add(layer);
		if (layer.group) {
			// 存在群组
			this.layers.forEach((v) => {
				if (v.group === layer.group) {
					// 同时选中同一个群组的图层
					this.selectedLayers.add(v);
				}
			});
		}
		// 更新ui
		this.selectedLayers = new Set(this.selectedLayers);
	}

	/**
	 * 画布自适应大小
	 */
	zoomAuto() {
		const { areaElement, zoomElement, layoutContainer, screenInfo } = this;
		const pageLayout = screenInfo ? screenInfo.style : undefined;

		if (!pageLayout) return;

		if (areaElement && zoomElement && layoutContainer) {
			const { width, height } = areaElement.getBoundingClientRect();
			let zoom = 0;
			if (
				pageLayout.width < areaElement.offsetWidth &&
				pageLayout.height < areaElement.offsetHeight
			) {
				zoom = 1;
			} else {
				zoom = parseFloat(
					pageLayout.width >= pageLayout.height
						? ((width / pageLayout.width) * 0.85).toFixed(2)
						: ((height / pageLayout.height) * 0.85).toFixed(2)
				);
			}
			layoutContainer.style.transform = `scale(${zoom})`;
			layoutContainer.style.transformOrigin = "0 0 0";
			zoomElement.style.width = `${pageLayout.width * zoom}px`;
			zoomElement.style.height = `${pageLayout.height * zoom}px`;
			this.scale = zoom;
		}
	}

	/**
	 * 缩放画布
	 * @param isUp
	 * @returns
	 */
	zoom(isUp: boolean) {
		const { scale, layoutContainer, zoomElement, screenInfo } = this;
		const pageLayout = screenInfo ? screenInfo.style : undefined;

		if (!pageLayout || (!isUp && scale <= 0.1) || (isUp && scale >= 2)) return;

		let scaleInt = 1;
		if (isUp) {
			scaleInt = Math.floor(scale * 10) + 1;
		} else {
			scaleInt = Math.ceil(scale * 10) - 1;
		}

		scaleInt = parseFloat((scaleInt / 10).toFixed(2));
		if (layoutContainer && zoomElement && pageLayout) {
			layoutContainer.style.transform = `scale(${scaleInt})`;
			layoutContainer.style.transformOrigin = "0 0 0";
			zoomElement.style.width = `${pageLayout.width * scaleInt}px`;
			zoomElement.style.height = `${pageLayout.height * scaleInt}px`;
			this.scale = scaleInt;
		}
	}

	/**
	 * 保存页面信息
	 */
	async saveScreen() {
		if (!this.screenInfo || this.saveLoading) return;

		this.saveLoading = true;
		await service.updateLayer({...this.screenInfo, projectId: undefined, createAt: undefined, updateAt: undefined});
		this.saveLoading = false;
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
	 * 重新加载图层
	 */
	async reloadLayer() {
		const ids: string[] = [];
		this.selectedLayers.forEach((v) => {
			ids.push(v.id);
		});
		this.reloadLayerIds = ids;
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
		this.addUndoData();
		this.mouseDownEvent = undefined;
		this.layers.push(layer);
		// 缓存组件库加载信息
		if (!this.packScriptMap.has(layer.component.packId)) {
			this.packScriptMap.set(layer.component.packId, { scriptUrl, external });
		}
		// 更新ui
		this.layers = [...this.layers];
		this.screenInfo!.layers = this.layers;
	}

	/**
	 * 加载组件
	 * @param packId
	 * @param exportName
	 */
	async loadComponent(
		packId: string,
		exportName: string
	): Promise<Constructor<MojitoComponent> | undefined> {
		const loaded = this.loadedPackComponent.get(packId);
		if (loaded && loaded[exportName]) {
			return loaded[exportName];
		}

		let packInfo:any = this.packScriptMap.get(packId);
		if (!packInfo) {
			// 调用接口获取信息
			const reqPackDetail = getPackDetail(packId) as Promise<ComponentPackInfo>;
			this.packScriptMap.set(packId, reqPackDetail);

			const rel = await reqPackDetail;
			if (!rel) {
				message.error("没有相关组件");
				this.packScriptMap.delete(packId);
				return;
			}
			// 获取组件库脚本地址
			const scriptUrl = getPackScriptUrl(rel.packUrl, rel.name);
			packInfo = {
				scriptUrl,
				external: rel.external,
			};
			// 缓存组件库信息
			this.packScriptMap.set(packId, packInfo);
		}else if(packInfo.then){
			// 其它图层正在请求，等待结果返回
			const rel = await packInfo;
			if (!rel) {
				return;
			}
			const scriptUrl = getPackScriptUrl(rel.packUrl, rel.name);
			packInfo = {
				scriptUrl,
				external: rel.external,
			};
		}

		if (packInfo?.external) {
			// 加载依赖
			System.addImportMap({
				imports: packInfo.external,
			});
		}

		if (packInfo?.scriptUrl) {
			// 加载组件库脚本
			const components = await System.import(packInfo.scriptUrl).catch(
				(e: Error) => {
					message.error(e.message);
					console.error(e);
				}
			);
	
			if (
				components &&
				components[exportName] &&
				typeof components[exportName] === "function"
			) {
				// 获取组件
				const comp = await components[exportName]().catch((e: Error) => {
					message.error(e.message);
					console.error(e);
				});
				console.log(`Load ${exportName}`, comp);
				if (comp) {
					this.loadedPackComponent.set(packId, {
						...loaded,
						[exportName]: comp,
					});
					return comp;
				}
			}
		}
	}

	/**
	 * 组件加载完成后自动设置图层大小为组件大小
	 * @param width
	 * @param height
	 */
	initLayerSize(layerId: string, width: number, height: number) {
		if (this.screenInfo && this.screenInfo.layers) {
			const layer = this.screenInfo.layers.find((v) => v.id === layerId);
			if (layer) {
				layer.style.x = layer.style.x + layer.style.width / 2 - width / 2;
				layer.style.y = layer.style.y + layer.style.height / 2 - height / 2;
				(layer.style.width = width),
					(layer.style.height = height),
					(layer.style = { ...layer.style });
				this.screenInfo = { ...this.screenInfo };
			}
		}
	}

	/**
	 * 更新图层样式
	 * @param layerId
	 * @param style
	 */
	updateLayerStyle(layerId: string | string[], style: ComponentStyle | ComponentStyle[]) {
		this.addUndoData();
		let layerIds:string[] = [];
		if(typeof layerId === "string"){
			layerIds.push(layerId);
		}else{
			layerIds = layerId;
		}

		const isArr = Array.isArray(style);
		layerIds.forEach((id, index) =>{
			const layer = this.layers.find((v) => v.id === id);
			if (layer) {
				layer.style = _.merge(layer.style, isArr ? style[index] : style);
			}
		});
		this.refreshLayer(layerIds);
	}

	/**
	 * 撤销
	 */
	undo() {
		const undoData = this.undoData.pop();
		if (!undoData) return;
		this.addRedoData();
		this.screenInfo = undoData;
		this.layers = this.screenInfo.layers || [];
		this.refreshLayer();
	}

	/**
	 * 重做
	 */
	redo() {
		const redoData = this.redoData.pop();
		if (!redoData) return;
		this.addUndoData();
		this.screenInfo = redoData;
		this.layers = this.screenInfo.layers || [];
		this.refreshLayer();
	}

	/**
	 * 群组图层
	 */
	async groupLayer() {
		this.addUndoData();
		const group = smallId();
		const layerIds: string[] = [];
		this.selectedLayers.forEach((layer) => {
			layer.group = group;
			layerIds.push(layer.id);
		});
		this.refreshLayer(layerIds);
	}

	/**
	 * 解除群组
	 */
	async disbandGroup() {
		this.addUndoData();
		const layerIds: string[] = [];
		this.selectedLayers.forEach((layer) => {
			delete layer.group;
			layerIds.push(layer.id);
		});
		this.refreshLayer(layerIds);
	}

	/**
	 * 锁定图层或图层组
	 * @param lock
	 */
	lockLayer(lock: boolean) {
		this.addUndoData();
		const layerIds: string[] = [];
		this.selectedLayers.forEach((layer) => {
			layer.lock = lock;
			layerIds.push(layer.id);
		});
		this.refreshLayer(layerIds);
	}

	/**
	 * 隐藏图层或图层组
	 * @param hide
	 */
	hideLayer(hide: boolean) {
		this.addUndoData();
		const layerIds: string[] = [];
		this.selectedLayers.forEach((layer) => {
			layer.hide = hide;
			layerIds.push(layer.id);
		});
		this.refreshLayer(layerIds);
	}

	/**
	 * 删除选中图层
	 */
	deleteLayer() {
		this.addUndoData();
		this.layers = this.layers.filter((layer) => {
			if (this.selectedLayers.has(layer)) {
				// 清除图层dom缓存
				this.layerDomCache.delete(layer.id);
				return false;
			}
			return true;
		});
		this.screenInfo!.layers = this.layers;
		this.cancelSelect();
	}

	/**
	 * 对齐图层
	 * @param type
	 * @returns
	 */
	alignHandler(type: AlignType) {
		if (this.selectedLayers.size < 1) return;

		this.addUndoData();
		const layers = Array.from(this.selectedLayers);
		const isGroup = layers.length === 1 || this.isAllGroup;
		const rect = this.moveableRect
			? this.moveableRect
			: { width: 0, height: 0, left: 0, top: 0 };
		const width = this.screenInfo?.style.width || 0;
		const height = this.screenInfo?.style.height || 0;
		let offsetX = 0;
		let offsetY = 0;

		switch (type) {
			case "left":
				offsetX = rect.left;
				break;
			case "right":
				offsetX = isGroup
					? width - (rect.left + rect.width)
					: rect.left + rect.width;
				break;
			case "top":
				offsetY = rect.top;
				break;
			case "bottom":
				offsetY = isGroup
					? height - (rect.top + rect.height)
					: rect.top + rect.height;
				break;
			case "h-center":
				offsetY = isGroup
					? (height - rect.height) / 2 - rect.top
					: rect.top + rect.height / 2;
				break;
			case "v-center":
				offsetX = isGroup
					? (width - rect.width) / 2 - rect.left
					: rect.left + rect.width / 2;
				break;
		}

		const ids: string[] = [];
		layers.forEach((v) => {
			ids.push(v.id);
			if (type === "right") {
				// 右对齐
				v.style.x += isGroup ? offsetX : offsetX - (v.style.x + v.style.width);
			} else if (type === "left") {
				// 左对齐
				v.style.x -= isGroup ? offsetX : v.style.x - offsetX;
			} else if (type === "v-center") {
				// 水平居中
				v.style.x += isGroup
					? offsetX
					: offsetX - (v.style.x + v.style.width / 2);
			} else if (type === "h-center") {
				// 垂直居中
				v.style.y += isGroup
					? offsetY
					: offsetY - (v.style.y + v.style.height / 2);
			} else if (type === "top") {
				// 顶部对齐
				v.style.y -= isGroup ? offsetY : v.style.y - offsetY;
			} else if (type === "bottom") {
				// 底部对齐
				v.style.y += isGroup ? offsetY : offsetY - (v.style.y + v.style.height);
			}

			v.style = { ...v.style };
		});

		this.refreshLayer(ids);
	}

	copy(){
		if(this.selectedLayers.size){
			const select = Array.from(this.selectedLayers);
			sessionStorage.setItem("MojitoCopy", JSON.stringify(select));
		}
	}

	paste(){
		const data = sessionStorage.getItem("MojitoCopy");
		sessionStorage.removeItem("MojitoCopy")
		if(data){
			const copyLayers = JSON.parse(data) as LayerInfo[];
			const newId = smallId();
			const groupMap:any = {}
			copyLayers.forEach((v, index) =>{
				v.id = `${newId}${index}`;
				v.name = `${v.name}_copy`;
				v.style.x += 20;
				v.style.z += 1;
				if(v.group){
					if(!groupMap[v.group]){
						groupMap[v.group] = `g${newId}${index}`;
					}
					v.group = groupMap[v.group];
				}
			});
			this.layers = [...this.layers, ...copyLayers];
			this.screenInfo!.layers = this.layers;
		}
	}
}
