/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import type { ExtendOptionsInit, RequestMethod, RequestOptionsInit } from 'umi-request';
import { extend } from 'umi-request';

export type RequestOptions = RequestOptionsInit;

export class Request {

  private _req!: RequestMethod<false>

  constructor(opts?: ExtendOptionsInit) {
    this._req = extend({
      ...opts,
    });
  }

  get req() {
    return this._req
  }

  get interceptors() {
    return this._req.interceptors
  }

  get = async <T>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<T | undefined> => {
    return await this._req.get(url, { params, ...options });
  }

  post = async <T>(url: string, data?: Record<string, any>, options?: RequestOptions): Promise<T | undefined> => {
    return await this._req.post(url, { data, ...options });
  }

  upload = async <T>(url: string, data: Record<string, any>, options?: RequestOptions): Promise<T | undefined> => {
    const formData = new FormData();
    for (const name in data) {
      formData.append(name, data[name]);
    }

    return await this._req.post(url, { ...options, requestType: "form", data: formData });
  }


  list = async <T>(url: string, data?: Record<string, any>, options?: RequestOptions): Promise<{ data: T[], total: number, success: boolean }> => {
    const rel = await this.post<{ list: T[], total: number }>(url, data, options);
    if (rel) {
      return { data: rel.list, total: rel.total, success: true }
    }
    return { data: [], total: 0, success: true }
  }
}