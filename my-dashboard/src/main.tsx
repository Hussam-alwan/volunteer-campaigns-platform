import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // البيانات تبقى "طازجة" لمدة دقيقة، فلا يُعاد جلبها عند كل تنقل بين الصفحات
      staleTime: 60_000,
      // تُحفظ في الكاش 5 دقائق بعد آخر استخدام لعرضها فوراً عند العودة للصفحة
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
