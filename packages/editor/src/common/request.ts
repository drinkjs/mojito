import { Request } from '@/common/network';
import { message } from 'antd';
import { ResponseError } from 'umi-request';

const { VITE_TOKEN } = import.meta.env;

const request = new Request({
  requestType: "json",
  credentials: 'include', // 默认请求是否带上cookie
  prefix: '/api',
  errorHandler: (error: ResponseError) => {
    message.error({content: error.message, key: error.message});
    // 阻断执行，并将错误信息传递下去
    return Promise.reject(error);
  }
});

request.interceptors.request.use((_, options) => {
  const token = localStorage.getItem("token") || VITE_TOKEN;
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
  } if (rel.code === 403) {
    localStorage.removeItem("token");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000)
  }
  throw new Error(rel.msg || rel.message);
})

export const { get, post, list, upload } = request;

export default request