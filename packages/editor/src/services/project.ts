import {get, post} from '../common/request';

/**
 * 添加项目
 * @param {*} params
 * @returns
 */
export const addProject = (params: ObjectParams) => post('/project/add', params);

/**
 * 项目列表
 * @returns
 */
export const getProjectList = () => get<ProjectInfo[]>('/project/list');

/**
 * 更新项目
 * @param {*} params
 * @returns
 */
export const updateProject = (params: ObjectParams) => post('/project/update', params);
/**
 * 删除项目
 * @param {*} params
 * @returns
 */

export const delteProject = (id: string) => get('/project/delete', { id });

/**
 * 项目明细
 * @param {*} params
 * @returns
 */
export const getProjectDetail = (id: string) => get<ProjectInfo>('/project/detail', { id });
