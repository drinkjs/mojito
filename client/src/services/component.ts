import { get, post } from '../common/network';
/**
 * 查询组件类型树
 * @returns
 */
export const getTypeTree = () => get('/component/types', {});
/**
 * 新增组件
 * @param {*} params
 * @returns
 */
export const addComponent = (params: any) => post('/component/add', params);

/**
 * 根据类型查询组件
 * @param {*} params
 * @returns
 */
export const getTypeComponent = (type: string) =>
  get('/component/list', { type });
/**
 * 组件明细信息
 * @param {*} params
 * @returns
 */
export const getComponentInfo = (id: string) =>
  get('/component/detail', { id });
/**
 * 更新组件
 * @param {*} params
 * @returns
 */
export const updateComponent = (params: any) =>
  post('/component/update', params);
/**
 * 删除组件
 * @param {*} params
 * @returns
 */
export const removeComponent = (id: string) => get('/component/delete', { id });
/**
 * 添加分类
 * @param {*} params
 * @returns
 */
export const addType = (params: any) => post('/component/type/add', params);

/**
 * 添加分类
 * @param {*} params
 * @returns
 */
export const removeType = (id: string) => get('/component/type/delete', { id });

/**
 * 添加分类
 * @param {*} params
 * @returns
 */
export const updateType = (params: any) =>
  post('/component/type/update', params);
