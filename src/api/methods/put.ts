import { request } from "../request";
import { client } from "../client";

export const apiPut = <T, D>(endpoint: string, data: D) =>
  request<T>(() => client.put(endpoint, data));

export const updateById = <T, D>(endpoint: string, id: string | number, payload: D) =>
  apiPut<T, D>(`${endpoint}/${id}`, payload);

export const update = <T, D>(endpoint: string, payload: D) =>
  apiPut<T, D>(endpoint, payload);
