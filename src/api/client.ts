import axios from "axios";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost/api3/v3/public/',
  timeout: 10000,
  headers: { "Content-Type": "application/json" }
});

client.interceptors.response.use(
  res => res,
  err => Promise.reject(err)
);
