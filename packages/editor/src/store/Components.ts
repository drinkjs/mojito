import * as service from "@/services/component";
import { message } from "antd";
import { makeObservable } from "fertile";

export default class Components {
	typeTree: ComponentTypeTree[] = [];

	typeComponentPacks: ComponentPackInfo[] = [];

	componentInfo: ComponentInfo | null = null;

	getTypeTreeLoading = false;

	addLoading = false;

	addTypeLoading = false;

	currSelectType: string | null = null;

	getLibsLoading = false;

	componentLibs: ComponentPackInfo[] = [];

	iconfont?: { id: string, url?: string }

	constructor() {
		makeObservable(this, { currSelectType: false });
	}

	/**
	 * 组件类树
	 */
	async getTypeTree() {
		this.getTypeTreeLoading = true;
		const data = await service.getTypeTree();
		this.getTypeTreeLoading = false;
		if (data) {
			this.typeTree = this.formatTypes(data);
		}
	}

	/**
	 * 组件类树
	 */
	async getUserTypeTree() {
		this.getTypeTreeLoading = true;
		const data = await service.getUserTypeTree().catch(() => null);
		return data;
	}

	/**
	 * 生成类型树
	 * @param types
	 * @param pid
	 */
	formatTypes(types: ComponentTypeTree[], pid?: string): ComponentTypeTree[] {
		const arr: ComponentTypeTree[] = [];
		types.forEach((v) => {
			if (v.pid === pid) {
				const children = this.formatTypes(types, v.id);
				if (children.length > 0) {
					v.children = children;
				}
				arr.push(v);
			}
		});
		return arr;
	}

	/**
	 * 添加分类
	 * @param data
	 * @returns
	 */
	async addType(data: ComponentTypeTree) {
		this.addTypeLoading = true;
		const rel = await service.addType(data).catch(() => null);
		if (rel) {
			message.success("添加成功");
			this.getTypeTree();
		}
		this.addTypeLoading = false;
		return rel;
	}

	/**
	 * 删除分类
	 * @param id
	 * @returns
	 */
	async removeType(id: string) {
		this.addTypeLoading = true;
		service.removeType(id).then(() => {
			message.success("删除成功");
			this.getTypeTree();
		}).finally(() => {
			this.addTypeLoading = false;
		});
	}

	/**
	 * 更新分类
	 * @param data
	 * @returns
	 */
	async updateType(data: ComponentTypeTree) {
		this.addTypeLoading = true;
		const rel = await service.updateType(data).catch(() => null);
		if (rel) {
			message.success("更新成功");
			this.getTypeTree();
		}
		this.addTypeLoading = false;
		return rel
	}

	/**
	 * 增加组件
	 * @param params
	 */
	async addComponentLib(params: ComponentPackInfo) {
		return service.addComponent(params).then(() => {
			if (this.currSelectType) {
				this.getTypeComponent(this.currSelectType);
			}
			return true;
		})
	}

	/**
	 * 更新组件
	 * @param params
	 */
	async updateComponentLib(params: ComponentPackInfo) {
		return service.updateComponent(params).then(() => {
			if (this.currSelectType) {
				this.getTypeComponent(this.currSelectType);
			}
			return true;
		})
	}

	/**
	 * 组件库
	 */
	async getComponentLibs(type: string) {
		this.getLibsLoading = true;
		service.getComponentLibs(type).then((data) => {
			this.componentLibs = data || []
		}).finally(() => {
			this.getLibsLoading = false;
		})
	}

	/**
	 * 某种类型下的组件
	 * @param type
	 */
	async getTypeComponent(type: string) {
		this.currSelectType = type;
		const data = await service.getTypeComponent(type);
		this.typeComponentPacks = data || [];
	}

	/**
	 * 删除组件库
	 * @param id
	 */
	async removeComponentLib(id: string) {
		return service.removeComponentLib(id).then(() => {
			return true;
		})
	}

	/**
	 * get iconfont
	 */
	async getIconFont() {
		return service.getIconFont().then((data) => {
			if (data) {
				this.iconfont = data
			}
		})
	}

	/**
	 * add iconfont
	 */
	async addIconFont(url: string) {
		this.addTypeLoading = true;
		return service.addIconFont(url).then((id) => {
			message.success("操作成功");
			if (id) {
				this.iconfont = { url, id }
			}
			return true;
		}).finally(()=>{
			this.addTypeLoading = false;
		})
	}

	/**
	 * add iconfont
	 */
	async updateIconFont(params: { url?: string, id: string }) {
		this.addTypeLoading = true;
		return service.updateIconFont(params).then((data) => {
			message.success("操作成功");
			if (data) {
				this.iconfont = params.url ? params : undefined;
			}
			return true;
		}).finally(()=>{
			this.addTypeLoading = false;
		})
	}
}
