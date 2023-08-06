import { get, post } from "../common/request";
/**
 * 查询组件类型树
 * @returns
 */
export const getTypeTree = () => get<ComponentTypeTree[]>("/component/types");

/**
 * 查询组件类型树
 * @returns
 */
export const getUserTypeTree = () => get<ComponentTypeTree[]>("/component/user/types");

/**
 * 组件库明细
 * @param id
 * @returns
 */
export const getPackDetail = (id: string | string[]) =>
	post<ComponentPackInfo | ComponentPackInfo[]>("/component/pack/detail", { id });
/**
 * 新增组件
 * @param {*} params
 * @returns
 */
export const addComponent = (params: ComponentPackInfo) =>
	post("/component/add", params);

/**
 * 根据类型查询组件
 * @param {*} params
 * @returns
 */
export const getTypeComponent = (type: string) =>
	get<ComponentPackInfo[]>("/component/list", { type });

/**
 * 根据类型查询组件
 * @param {*} params
 * @returns
 */
export const getComponentLibs = (type: string) =>
	get<ComponentPackInfo[]>("/component/libs", { type });

/**
 * 组件明细信息
 * @param {*} params
 * @returns
 */
export const getComponentInfo = (id: string) =>
	get("/component/detail", { id });
/**
 * 更新组件
 * @param {*} params
 * @returns
 */
export const updateComponent = (params: any) =>
	post("/component/update", params);
/**
 * 删除组件
 * @param {*} params
 * @returns
 */
export const removeComponentLib = (id: string) => get("/component/lib/delete", { id });
/**
 * 添加分类
 * @param {*} params
 * @returns
 */
export const addType = (params: any) => post("/component/type/add", params);

/**
 * 添加分类
 * @param {*} params
 * @returns
 */
export const removeType = (id: string) => get("/component/type/delete", { id });

/**
 * 添加分类
 * @param {*} params
 * @returns
 */
export const updateType = (params: any) =>
	post("/component/type/update", params);


/**
 * 图标库
 * @returns 
 */
export const getIconFont = () =>
	get<{ url?: string, id: string }>("/component/iconfont");

/**
 * add iconfont
 * @returns 
 */
export const addIconFont = (url: string) =>
	post<string>("/component/iconfont/add", { url });

/**
 * update iconfont
 * @returns 
 */
export const updateIconFont = (data: any) =>
	post("/component/iconfont/update", data);