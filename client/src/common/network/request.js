/*
 * @Author: ouruiting
 * @Date: 2020-05-26 14:17:30
 * @LastEditors: ouruiting
 * @LastEditTime: 2020-05-27 09:40:26
 * @Description: file content
 */

import axios from 'axios';
import { message } from 'antd';

const API = '/api';

function showError (content) {
  message.error({ content, key: "networkError" });
}

/**
 * 获取方法
 * @param originUrl
 * @param originOptions [options]
 * @return {Promise<T | void>}
 */
function request (originUrl, method = 'get', params = {}, options = {}) {
  const reg = /^(http|https):\/\/.+/;
  const { prefix, checkCode = true, ...opts } = options;
  return new Promise((resolve, reject) => {
    const lowerMethod = method.toLocaleLowerCase();
    axios({
      method,
      url: reg.test(originUrl)
        ? originUrl
        : `${prefix === '/' ? '' : API}${originUrl}`,
      params: lowerMethod === 'get' ? params : {},
      data: lowerMethod !== 'get' ? params : {},
      ...opts,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        ...opts.headers
      }
    })
      .then((response) => {
        if (!response || !response.data) {
          showError(`${originUrl}请求错误`);
          reject(new Error(`${originUrl}请求错误`));
          return;
        }
        return response.data;
      })
      .then((data) => {
        if (!checkCode) {
          return resolve(data);
        }
        if (data && data.code === 0) {
          return resolve(data.data);
        }
        showError(data.msg || `${originUrl}请求错误`);
        // if (response.data.code === 403) window.location.href = "/login";
        reject(data);
      })
      .catch((err) => {
        showError(`${originUrl}请求失败`);
        reject(err);
      });
  });
}

export default request;
