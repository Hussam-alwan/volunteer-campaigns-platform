import axios from "axios";
import { API_BASE_URL } from "../constants/domain";

// نسخة أكسيوس قائمة على الكوكيز: تُرسل كوكي الجلسة (HttpOnly) تلقائياً مع كل طلب.
const ApiInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default ApiInstance;
