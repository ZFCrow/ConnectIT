// src/axiosConfig.ts
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

// re-export the AxiosResponse interface for consumers
export type { AxiosResponse } from "axios";

// always send cookies
axios.defaults.withCredentials = true;

// on every request…
axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // pull the csrf_token cookie
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  const csrf = match ? match[1] : "";

  // wrap any existing headers into an AxiosHeaders instance
  const headers = new AxiosHeaders(config.headers || {});
  headers.set("X-CSRFToken", csrf);

  // re-assign back onto config
  config.headers = headers;
  return config;
}, (err) => Promise.reject(err));

export default axios;
