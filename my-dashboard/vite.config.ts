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
      // Dev proxy to the local backend (docker compose) so requests stay same-origin
      "/api-backend": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-backend/, ""),
        // make the session cookie host-only on localhost so the browser sends it
        cookieDomainRewrite: "",
      },
    },
  },
});
