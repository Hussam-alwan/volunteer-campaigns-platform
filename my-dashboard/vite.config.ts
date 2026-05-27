import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Backend the dev server proxies to. Override with VITE_DEV_BACKEND_URL
// in .env.development (e.g. https://sbc-production.up.railway.app/ to
// hit Railway instead of localhost).
const DEFAULT_BACKEND = "http://localhost:8080/";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const target = env.VITE_DEV_BACKEND_URL || DEFAULT_BACKEND;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api-railway": {
          target,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: "localhost",
          cookiePathRewrite: "/",
          rewrite: (p) => p.replace(/^\/api-railway/, ""),
        },
      },
    },
  };
});
