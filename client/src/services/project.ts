import { get, post } from '../common/network';

/**
 * 添加项目
 * @param {*} params
 * @returns
 */
export const projectAdd = (params: any) => post('/project/add', params);

/**
 * 项目列表
 * @returns
 */
export const projectList = () => get('/project/list');

/**
 * 更新项目
 * @param {*} params
 * @returns
 */
export const projectUpdate = (params: any) => post('/project/update', params);
/**
 * 删除项目
 * @param {*} params
 * @returns
 */

export const projectDelete = (id: string) => get('/project/delete', { id });

/**
 * 项目明细
 * @param {*} params
 * @returns
 */
export const projectDetail = (id: string) => get('/project/detail', { id });
