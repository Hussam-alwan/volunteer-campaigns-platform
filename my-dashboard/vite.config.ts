import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // الـ Proxy بيلقط أي طلب بيبدأ بـ /api-railway
      "/api-railway": {
        target: "https://sbc-production-cd86.up.railway.app",
        changeOrigin: true,
        secure: true,
        // بنحذف كلمة /api-railway قبل ما نبعت الطلب للسيرفر ليروح المسار للباك-إند صح (/api/v1/...)
        rewrite: (path) => path.replace(/^\/api-railway/, ""),
      },
    },
  },
});
