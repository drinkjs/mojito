import { post } from '../common/network';

/**
 * 测试数据库连接
 * @param {*} params
 * @returns
 */
export const datasourceTest = (params: any) => post('/datasource/test', params);
