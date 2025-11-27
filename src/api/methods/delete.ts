import { client } from '../client';
import { request } from '../request';

export const apiDelete = <T>(endpoint: string, params?: object) =>
  request<T>(() => client.delete(endpoint, { params }));

export const deleteById = <T>(endpoint: string, id: string|number) =>
  apiDelete<T>(`${endpoint}/${id}`);

export const deleteMultiple = <T>(endpoint: string, ids: (string|number)[]) =>
  apiDelete<T>(endpoint, { ids });

