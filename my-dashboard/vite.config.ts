import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Backend the dev server proxies to. Override with VITE_DEV_BACKEND_URL
// in .env.development (e.g. https://sbc-production.up.railway.app/) if
// you want to hit a remote host instead of the local backend.
const DEFAULT_BACKEND = "http://localhost:8080/";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const target = env.VITE_DEV_BACKEND_URL || DEFAULT_BACKEND;

  const proxyEntry = {
    target,
    changeOrigin: true,
    secure: false,
    cookieDomainRewrite: "localhost",
    cookiePathRewrite: "/",
  };

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": proxyEntry,
        "/uploads": proxyEntry,
        "/api-railway": {
          ...proxyEntry,
          rewrite: (p) => p.replace(/^\/api-railway/, ""),
        },
      },
    },
  };
});
