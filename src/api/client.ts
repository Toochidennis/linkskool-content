import axios, { type InternalAxiosRequestConfig } from "axios";
import { toCamel, toSnake } from "./util/transform";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 300000,
  headers: {
    "X-API-KEY": import.meta.env.VITE_API_KEY
  }
});

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      return config;
    }

    if (config.data) {
      config.headers["Content-Type"] = "application/json";
      config.data = toSnake(config.data);
    }

    // console.log(`${config.method?.toUpperCase()} ${config.url}`, {
    //   data: config.data,
    //   params: config.params,
    //   headers: config.headers
    // });
    return config;
  },
  err => Promise.reject(err)
);

client.interceptors.response.use(
  res => {
    if (res.data) {
      res.data = toCamel(res.data);
    }
    return res;
  },
  err => {
    console.error('API Error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
      url: err.config?.url,
      method: err.config?.method
    });
    return Promise.reject(err);
  }
);
