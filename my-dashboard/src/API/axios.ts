// src/api/axios.ts
import axios, { type InternalAxiosRequestConfig } from "axios";

const API = axios.create({
  baseURL: "https://sbc-production.up.railway.app/api/v1/", // أضفنا / هنا بالآخر
  headers: {
    "Content-Type": "application/json",
  },
});
// إرسال الـ Token تلقائياً مع كل طلب إذا كان المستخدم مسجل دخوله
API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
