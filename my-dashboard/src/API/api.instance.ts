// src/API/api.instance.ts
import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
// الرابط الثابت الذي ينتهي بـ /api/v1 لـ Railway
import { API_BASE_URL } from "../constants/domain";

const ApiInstance = axios.create({
  baseURL: API_BASE_URL,
  // إرسال واستقبال كوكي الجلسة (HttpOnly) تلقائياً مع كل طلب
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// إنترسبتور الطلبات
ApiInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ترتيب المصفوفات في الـ Query Params بشكل يفهمه سيرفر Spring Boot
    config.paramsSerializer = { indexes: null };
    return config;
  },
  (error) => Promise.reject(error),
);

// إنترسبتور الاستجابة
ApiInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error),
);

export default ApiInstance;
