// src/api/axios.ts
import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
// استيراد الرابط الثابت الذي ينتهي بـ /api/v1 لـ Railway
import { API_BASE_URL } from "../constants/domain";
// استيراد الـ Zustand Store الجديد الخاص بمشروعك
import useAuthStore from "../store/auth.store";

const ApiInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// إنترسبتور الطلبات (Request Interceptor)
ApiInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ترتيب المصفوفات في الروابط (Query Params) بشكل نظيف ليفهمه سيرفر الـ Spring Boot
    config.paramsSerializer = { indexes: null };

    // جلب الـ Token مباشرة من الـ Zustand Store الجديد
    const token = useAuthStore.getState().token;

    if (token && token !== "cookie_session_active" && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// إنترسبتور الاستجابة (Response Interceptor)
ApiInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default ApiInstance;
