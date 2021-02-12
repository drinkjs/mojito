import request from './request';

/**
 * get 方法
 * @param url {String}
 * @param params {Object}
 * @param options [options] {Object}
 * @return {Promise}
 */
const get = (url, params = {}, options = {}) =>
  request(url, 'get', params, options);
/**
 * POST请求
 * @param url {String}
 * @param body {Object}
 * @param options [options] {Object}
 * @return {Promise}
 */
const post = (url, params = {}, options = {}) =>
  request(url, 'post', params, options);

export { request, get, post };
