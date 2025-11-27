import { client } from '../client';
import { request } from '../request';

export const apiGet = <T>(endpoint: string, params?: object) =>
  request<T>(() => client.get(endpoint, { params }));

export const getAll = <T>(endpoint: string) =>
  apiGet<T[]>(endpoint);

export const getById = <T>(endpoint: string, id: string | number) =>
  apiGet<T>(`${endpoint}/${id}`);

export const getWithParams = <T>(endpoint: string, params: object) =>
  apiGet<T>(endpoint, params);
