// الروابط الخاصة بمشروعك الحالي (Railway)
const DEVELOPMENT_BASE_URL = "https://sbc-production.up.railway.app";
const DEVELOPMENT_API_BASE_URL = "https://sbc-production.up.railway.app/api/v1";

export const SERVER_BASE_URL = DEVELOPMENT_BASE_URL;

// في وضع التطوير نمرّ عبر بروكسي Vite (/api-railway) ليصبح الطلب من نفس الـ Origin،
// فتُرسل كوكي الجلسة تلقائياً. في الإنتاج نستخدم رابط Railway المباشر.
export const API_BASE_URL = import.meta.env.DEV
  ? "/api-railway/api/v1"
  : DEVELOPMENT_API_BASE_URL;
