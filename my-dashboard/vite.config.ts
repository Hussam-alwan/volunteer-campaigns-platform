import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // اضافة الـ alias مشان نقدر نستخدم @ بدل ما نكتب المسار كامل
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // الـ Proxy بيلقط أي طلب بيبدأ بـ /api-railway
      "/api-railway": {
        target: "https://sbc-production.up.railway.app/",
        changeOrigin: true,
        secure: true,
        // بنحذف كلمة /api-railway قبل ما نبعت الطلب للسيرفر ليروح المسار للباك-إند صح (/api/v1/...)
        rewrite: (path) => path.replace(/^\/api-railway/, ""),
        // تجريد الـ Domain من كوكي الجلسة لتصبح host-only على localhost فيرسلها المتصفح
        cookieDomainRewrite: "",
      },
    },
  },
});
