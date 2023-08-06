import { Request } from '@mojito/common/network';
import { localCache } from '@mojito/common/util';
import { message } from 'antd';
import { v4 as uuid } from "uuid"

const request = new Request({
  prefix: '/api',
});

// 生成一个假token模拟用户请求
let token = localCache.get("token");
if (!token) {
  token = uuid();
  localCache.set("token", token);
}

request.interceptors.request.use((_, options) => {
  return {
    options: { ...options, headers: { ...options.headers, "x-token": token } },
  };
});

request.interceptors.response.use(async (response) => {
  const rel = await response.clone().json();
  if (!rel || rel.code === undefined || rel.code === null) {
    return rel;
  }

  if (rel.code === 0) {
    return rel.data;
  } else if (rel.msg || rel.message) {
    message.error(rel.msg || rel.message);
    throw new Error(rel.msg)
  }
})

export const { get, post, list, upload } = request;

export default request