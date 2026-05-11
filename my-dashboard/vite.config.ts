import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // استيراد التايلوند

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // إضافة التايلوند هنا
  ],
});
