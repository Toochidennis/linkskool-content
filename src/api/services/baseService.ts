import { client } from "../client";
import type { ApiResponse } from "../models";

export class BaseService<T, D = any> {
  constructor(private endpoint: string) { }

  private buildUrl(path?: string) {
    return path ? `${this.endpoint}/${path}` : this.endpoint;
  }

  async get<R = T>(path?: string, params?: any): Promise<ApiResponse<R>> {
    const r = await client.get<ApiResponse<R>>(this.buildUrl(path), { params });
    return r.data;
  }

  async post<R = T>(path?: string, data?: D): Promise<ApiResponse<R>> {
    const r = await client.post<ApiResponse<R>>(this.buildUrl(path), data);
    return r.data;
  }

  async put<R = T>(path?: string, data?: D): Promise<ApiResponse<R>> {
    const r = await client.put<ApiResponse<R>>(this.buildUrl(path), data);
    return r.data;
  }

  async delete<R = any>(path?: string, data?: D): Promise<ApiResponse<R>> {
    const r = await client.delete<ApiResponse<R>>(this.buildUrl(path), {
      data: !data ? {} : data
    });
    return r.data;
  }

  // For custom action endpoints like users/login
  action(path: string) {
    return {
      get: <R = any>(params?: any) =>
        client.get<ApiResponse<R>>(`${this.endpoint}/${path}`, { params }).then(r => r.data),

      post: <R = any>(data?: any) =>
        client.post<ApiResponse<R>>(`${this.endpoint}/${path}`, data).then(r => r.data),

      put: <R = any>(data?: any) =>
        client.put<ApiResponse<R>>(`${this.endpoint}/${path}`, data).then(r => r.data),

      delete: <R = any>() =>
        client.delete<ApiResponse<R>>(`${this.endpoint}/${path}`).then(r => r.data),
    };
  }
}
