// Where the Spring backend lives. Used to build server-relative asset URLs
// (e.g. uploaded photo paths). Empty string = same-origin (the nginx
// container proxies /uploads to the backend). Override with
// VITE_SERVER_BASE_URL at build time if you need a fully-qualified host.
export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL ?? "";

// API base URL.
// - Dockerized prod build: defaults to "/api/v1" (nginx proxies to backend).
// - Local `npm run dev`: set VITE_API_BASE_URL=/api-railway/api/v1 in
//   .env.development to use the Vite proxy to your local Spring backend.
// - Any other target: set VITE_API_BASE_URL=https://your.host/api/v1.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
