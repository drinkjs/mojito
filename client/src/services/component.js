import { get, post } from '../common/network';

export const getTypeTree = () => get('/component/types', {});
export const addComponent = (params) => post('/component/add', params);
export const addSystemComponent = (params) =>
  post('/component/add/system', params);
export const getTypeComponent = (params) => get('/component/list', params);
export const getComponentInfo = (params) => get('/component/detail', params);
export const updateComponent = (params) => post('/component/update', params);
export const getComponentBySystem = (params) =>
  get('/component/by/system', params);
export const removeComponent = (params) => get('/component/delete', params);
export const getByLibname = (params) => get('/component/by/libname', params);
