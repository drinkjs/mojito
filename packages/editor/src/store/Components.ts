import * as service from "@/services/component";
import { message } from "antd";
import { makeObservable } from "fertile";

export default class Components {
	typeTree: ComponentTypeTree[] = [];

	typeComponentPacks: ComponentPackInfo[] = [];

	systemComponent: ComponentInfo[] = [];

	componentInfo: ComponentInfo | null = null;

	getTypeTreeLoading = false;

	getComponentInfoLoading = false;

	addLoading = false;

	addTypeLoading = false;

	currSelectType: string | null = null;

	constructor(){
		makeObservable(this, {currSelectType: false});
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
		await service.addType(data);
		message.success("添加成功");
		this.getTypeTree();
		this.addTypeLoading = false;
	}

	/**
	 * 添加分类
	 * @param data
	 * @returns
	 */
	async removeType(id: string) {
		this.addTypeLoading = true;
		await service.removeType(id);
		message.success("删除成功");
		this.getTypeTree();
		this.addTypeLoading = false;
	}

	/**
	 * 更新分类
	 * @param data
	 * @returns
	 */
	async updateType(data: ComponentTypeTree) {
		this.addTypeLoading = true;
		await service.updateType(data);
		message.success("更新成功");
		this.getTypeTree();
		this.addTypeLoading = false;
	}

	/**
	 * 增加组件
	 * @param params
	 */
	async addComponent(params: ComponentPackInfo) {
		service.addComponent(params).then(()=>{
			if(this.currSelectType){
				this.getTypeComponent(this.currSelectType);
			}
		})
	}

	/**
	 * 更新组件
	 * @param params
	 */
	async updateComponent(params: ComponentInfo) {
		this.addLoading = true;
		const data = await service.updateComponent(params);
		this.addLoading = false;
		return data;
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
	 * 组件详情
	 * @param id
	 */
	async getComponentInfo(id: string) {
		this.getComponentInfoLoading = true;
		const data = service.getComponentInfo(id);
		this.getComponentInfoLoading = false;
		this.componentInfo = data;
	}

	/**
	 * 系统组件
	 * @param id
	 */
	async removeComponent(id: string) {
		return service.removeComponent(id);
	}
}
