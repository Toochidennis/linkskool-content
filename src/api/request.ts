import type { AxiosResponse } from "axios";

export async function request<T>(
  fn: () => Promise<AxiosResponse<T>>
): Promise<T> {
  const res = await fn();
  return res.data;
}
