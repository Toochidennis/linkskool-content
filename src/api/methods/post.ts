import { client } from '../client';
import { request } from '../request';

export const apiPost = <T, D>(endpoint: string, data: D) =>
  request<T>(() => client.post(endpoint, data));

export const create = <T, D>(endpoint: string, payload: D) =>
  apiPost<T, D>(endpoint, payload);
