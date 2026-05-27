// Where the Spring backend lives. Used to build server-relative asset URLs
// (e.g. uploaded photo paths). The API client itself uses API_BASE_URL.
export const SERVER_BASE_URL = "https://sbc-production.up.railway.app";

// API base URL.
// - In dev (Vite proxy), this is "/api-railway/api/v1" so requests stay
//   same-origin and the dev server forwards them to the backend.
// - In prod, set VITE_API_BASE_URL at build time, e.g.
//   VITE_API_BASE_URL=https://sbc-production.up.railway.app/api/v1
// If the env var is unset we fall back to the dev proxy path.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "/api-railway/api/v1";
