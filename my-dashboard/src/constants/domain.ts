// Local backend (run via docker compose). Overridable at build time with
// VITE_API_BASE_URL / VITE_SERVER_BASE_URL.
const LOCAL_SERVER = "http://localhost:8080";
const LOCAL_API = "http://localhost:8080/api/v1";

// Origin used for assets like uploaded photos.
export const SERVER_BASE_URL =
  import.meta.env.VITE_SERVER_BASE_URL ?? LOCAL_SERVER;

// In `vite dev` we proxy through /api-backend so requests stay same-origin and the
// session cookie is sent. In the production/Docker build we call the backend directly
// (the backend CORS allows http://localhost:* with credentials).
export const API_BASE_URL = import.meta.env.DEV
  ? "/api-backend/api/v1"
  : (import.meta.env.VITE_API_BASE_URL ?? LOCAL_API);
