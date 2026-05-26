import axios from "axios";

const ApiInstance = axios.create({
  baseURL: "https://sbc-production.up.railway.app/api/v1",
  withCredentials: true, // 👈 إجبار Axios على إرسال واستقبال الكوكيز مع كل طلب تلقائياً
});

ApiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // إذا كان هناك توكن في الـ localStorage نرسله، وإلا فالاعتماد على الكوكيز
    if (token && token !== "cookie_session_active") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Accept"] = "application/json";
    config.headers["Content-Type"] = "application/json";

    return config;
  },
  (error) => Promise.reject(error),
);

export default ApiInstance;
