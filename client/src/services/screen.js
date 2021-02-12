import { get, post } from '../common/network'

export const screenAdd = (params) => post('/screen/add', params)

export const screenList = (params) => get('/screen/list', params)

export const screenListByProjectName = (params) => get('/screen/list/projectName', params)

export const screenUpdate = (params) => post('/screen/update', params)

export const screenDelete = (params) => get('/screen/delete', params)

export const screenDetail = (params) => get('/screen/detail', params)

export const screenDetailLayers = (params) => get('/screen/view', params)

export const updateScreenCover = (params) => post('/screen/update/cover', params)
