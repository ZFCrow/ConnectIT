// src/api.ts
import baseAxios from "@/utility/axiosConfig";
import axios, { type AxiosInstance } from "axios";

// 1) Create a fresh instance whose only default is `baseURL = "/api"`
const api: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// 2) Copy over interceptors from your CSRF‐aware axiosConfig instance
;(baseAxios.interceptors.request as any).handlers.forEach((h: any) => {
  api.interceptors.request.use(h.fulfilled, h.rejected);
});
;(baseAxios.interceptors.response as any).handlers.forEach((h: any) => {
  api.interceptors.response.use(h.fulfilled, h.rejected);
});

// 3) Export it—only this `api` instance hits `/api` and carries CSRF + cookies
export { api };
