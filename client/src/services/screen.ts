import { get, post } from '../common/network';

/**
 * 新增页面
 * @param {*} params
 * @returns
 */
export const screenAdd = (params: any) => post('/screen/add', params);

/**
 * 页面列表
 * @param {*} params
 * @returns
 */
export const screenList = (params: any) => get('/screen/list', params);

/**
 * 通过项目名查页面列表
 * @param {*} params
 * @returns
 */
export const screenListByProjectName = (name: string) =>
  get('/screen/list/projectName', { name });

/**
 * 更新页面
 * @param {*} params
 * @returns
 */
export const screenUpdate = (params: any) => post('/screen/update', params);
/**
 * 更新图层
 * @param {*} params
 * @returns
 */
export const updateLayer = (params: any) =>
  post('/screen/update/layer', params);
/**
 * 删除页面
 * @param {*} params
 * @returns
 */
export const screenDelete = (id: string) => get('/screen/delete', { id });
/**
 * 页面明细
 * @param {*} params
 * @returns
 */
export const screenDetail = (id: string) => get('/screen/detail', { id });

/**
 * 更新封面
 * @param {*} params
 * @returns
 */
export const updateScreenCover = (params: any) =>
  post('/screen/update/cover', params);

/**
 * 预览
 * @param {*} params
 * @returns
 */
export const screenDetailByName = (projectName: string, screenName: string) =>
  post('/screen/view/detail', { projectName, screenName });

/**
 * 新增数据源连接
 * @param {*} params
 * @returns
 */
export const addDatasource = (params:any) =>
  post('/screen/datasource/add', params);

/**
 * 新增数据源连接
 * @param {*} params
 * @returns
 */
export const delDatasource = (params:any) =>
  post('/screen/datasource/delete', params);
