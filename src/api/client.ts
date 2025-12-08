import axios from "axios";
import { toCamel, toSnake } from "./util/transform";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "X-API-KEY": import.meta.env.VITE_API_KEY
  }
});

client.interceptors.request.use(
  config => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // If payload is FormData (file uploads), allow browser/axios set Content-Type
    if (config.data instanceof FormData) {
      // do not transform FormData
      return config;
    }

    if (config.data) {
      config.data = toSnake(config.data);
      // ensure JSON content-type for normal payloads
      if (!config.headers) config.headers = {};
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
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
