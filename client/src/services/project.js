import { get, post } from '../common/network'

export const projectAdd = (params) => post('/project/add', params)

export const projectList = () => get('/project/list')

export const projectUpdate = (params) => post('/project/update', params)
export const projectUpdateCDN = (params) => post('/project/update/cdn', params)

export const projectDelete = (params) => get('/project/delete', params)

export const projectDetail = (params) => get('/project/detail', params)
