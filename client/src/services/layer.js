import { get, post } from '../common/network';

export const addlayer = (params) => post('/layer/add', params);

export const updatelayer = (params) => post('/layer/update', params);

export const deletelayer = (params) => get('/layer/delete', params);

export const restoreLayer = (params) => get('/layer/restore', params);

export const getScreenLayers = (params) => get('/layer/screen/layers', params);

export const updateZ = (params) => post('/layer/batch/update/style', params);

export const batchUpdateLayer = (params) => post('/layer/batch/update', params);
