import * as service from "@/services/screen";
import { CSSProperties } from "react";

export default class Screen {
	getListLoading = false;
	addLoading = false;
	list: ScreenInfo[] = [];

	constructor() {
		// makeAutoObservable(this, {
		//   layers: computed,
		//   layerStyle: computed,
		//   layerGroup: computed,
		//   isSelectedGroup: computed,
		//   isLayerLock: computed,
		//   isLayerHide: computed
		// });
	}

	/**
	 * 页面列表
	 * @param projectId
	 */
	async getList(projectId: string) {
		this.getListLoading = true;
		this.list = (await service.getScreenList({ projectId })) || [];
		this.getListLoading = false;
	}

	/**
	 * 新增页面
	 * @param name
	 * @param projectId
	 */
	async add(name: string, projectId: string, style?: CSSProperties) {
		this.addLoading = true;
		return service
			.screenAdd({
				name,
				projectId,
				style: {
					width: 1920, // 页面默认宽度
					height: 1080, // 页面默认高度
					...style,
				},
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
	async edit(id: string, name: string, projectId: string, coveImg?: string) {
		this.addLoading = true;
		return service
			.screenUpdate({
				id,
				name,
				projectId,
				coveImg,
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
	async updateCover(id: string, path: string) {
		return service.updateScreenCover({ id, coverImg: path });
	}

	/**
	 * 删除页面
	 * @param id
	 */
	async remove(params:ScreenInfo) {
		this.addLoading = true;
		return service
			.deleteScreen(params.id)
			.then(() => {
				this.getList(params.projectId);
			})
			.finally(() => {
				this.addLoading = false;
			});
	}
}
