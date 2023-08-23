import "systemjs";
import { addStyles, StyleObject } from "shadow-style-loader/lib/addStylesShadow"
import * as service from "@/services/screen";
import { makeObservable } from "fertile";
import { CSSProperties } from "react";

export default class Screen {
	getListLoading = false;
	addLoading = false;
	list: ScreenInfo[] = [];

	// mojito-vue-style-loader传过来的样式
	mojitoStylesMap: Map<string, StyleObject[]> = new Map();

	constructor() {
		makeObservable(this, {
			mojitoStylesMap: false,
		});
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
	async remove(params: ScreenInfo) {
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

	/**
	 * 接收mojito-vue-style-loader发过来的的样式
	 * @param params
	 */
	receiveMojitoStyle(params: {
		flag:string
		styles: StyleObject[];
	}) {
		let styles = this.mojitoStylesMap.get(params.flag);
		if (!styles) {
			styles = [...params.styles];
			this.mojitoStylesMap.set(params.flag, styles);
		} else {
			for (const style of params.styles) {
				if (styles.find((curr) => style.id !== curr.id)) {
					styles.push(style);
				}
			}
		}
	}

	/**
	 * 添加样式到shadowRoot
	 * @param flag
	 * @param shadowRoot
	 */
	addMojitoStyle(flag:string, shadowRoot: ShadowRoot) {
		const styles = this.mojitoStylesMap.get(flag);
		if (styles) {
			addStyles(styles, shadowRoot);
		}
	}
}
