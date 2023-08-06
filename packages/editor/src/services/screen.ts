import {get, post, upload} from '../common/request';

/**
 * 新增页面
 * @param {*} params
 * @returns
 */
export const screenAdd = (data: ObjectParams) => post('/screen/add', data);

/**
 * 页面列表
 * @param {*} params
 * @returns
 */
export const getScreenList = (params: ObjectParams) => get<ScreenInfo[]>('/screen/list', params);

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
export const screenUpdate = (params: ObjectParams) => post('/screen/update', params);
/**
 * 更新图层
 * @param {*} params
 * @returns
 */
export const updateLayer = (params: ObjectParams) =>
  post('/screen/update/layer', params);
/**
 * 删除页面
 * @param {*} params
 * @returns
 */
export const deleteScreen = (id: string) => get('/screen/delete', { id });
/**
 * 页面明细
 * @param {*} params
 * @returns
 */
export const getScreenDetail = (id: string) => get<{screenInfo: ScreenDetail, packInfo?:ComponentPackInfo[]}>('/screen/editor/detail', { id });

/**
 * 更新封面
 * @param {*} params
 * @returns
 */
export const updateScreenCover = (params: ObjectParams) =>
  post('/screen/update/cover', params);

/**
 * 预览
 * @param {*} params
 * @returns
 */
export const getScreenDetailByName = (projectName: string, screenName: string) =>
  post<ScreenDetail>('/screen/view/detail', { projectName, screenName });

/**
 * 新增数据源连接
 * @param {*} params
 * @returns
 */
export const addDatasource = (params:ObjectParams) =>
  post('/screen/datasource/add', params);

/**
 * 新增数据源连接
 * @param {*} params
 * @returns
 */
export const delDatasource = (params:ObjectParams) =>
  post('/screen/datasource/delete', params);
