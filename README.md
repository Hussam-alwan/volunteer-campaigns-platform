# Impact — Volunteer Campaigns Platform

Backend service for a university volunteer-campaigns platform. Students apply to volunteering campaigns posted by colleges; staff approve, track progress, and record attendance.

## Tech Stack

- **Java 21** / **Spring Boot 4**
- **PostgreSQL 16** (via Docker)
- **Spring Security** (session-based login/logout, BCrypt passwords)
- **Spring Data JPA** + Hibernate
- **MapStruct** for DTO mapping, **Lombok** for boilerplate
- **springdoc-openapi** (Swagger UI)
- Maven (with `mvnw` wrapper)

## Prerequisites

- JDK 21
- Docker + Docker Compose

## Running locally

### 1. Start PostgreSQL

```bash
docker compose up -d postgresql
```

Postgres listens on `localhost:5433`, database `impact`, user `postgres` / `P4ssword!`.

### 2. Start the app

```bash
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`. Swagger UI at `http://localhost:8080/swagger-ui.html`.

## Authentication

Session-based: after a successful `POST /api/v1/auth/login`, the server sets a `JSESSIONID` cookie. The browser/SPA must send that cookie on subsequent requests (use `fetch(..., { credentials: 'include' })`).

### Endpoints

| Method | Path                       | Auth     | Body                                        | Description                |
| ------ | -------------------------- | -------- | ------------------------------------------- | -------------------------- |
| POST   | `/api/v1/auth/register`    | Public   | `UserRequestDTO` (with `password`)          | Create a new user account  |
| POST   | `/api/v1/auth/login`       | Public   | `{ "email": "...", "password": "..." }`     | Log in, sets session cookie |
| POST   | `/api/v1/auth/logout`      | Required | —                                           | Invalidate the session     |
| GET    | `/api/v1/auth/me`          | Required | —                                           | Current authenticated user |

All other `/api/v1/...` endpoints require an authenticated session. Anonymous requests get `401 Unauthorized`.

### Frontend example (fetch)

```js
// Log in
await fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email: 'student@example.com', password: 'secret123' }),
});

// Authenticated call
const me = await fetch('http://localhost:8080/api/v1/auth/me', {
  credentials: 'include',
}).then(r => r.json());

// Log out
await fetch('http://localhost:8080/api/v1/auth/logout', {
  method: 'POST',
  credentials: 'include',
});
```

CORS already allows `http://localhost:*` and `http://127.0.0.1:*` with credentials.

## Configuration

| Variable                      | Default                                             | Purpose         |
| ----------------------------- | --------------------------------------------------- | --------------- |
| `SPRING_DATASOURCE_URL`       | `jdbc:postgresql://localhost:5433/impact`           | JDBC URL        |
| `SPRING_DATASOURCE_USERNAME`  | `postgres`                                          | DB user         |
| `SPRING_DATASOURCE_PASSWORD`  | `P4ssword!`                                         | DB password     |
| `APP_UPLOAD_DIR`              | `uploads/photos`                                    | Photo upload dir |

## Docker

```bash
docker build -t impact-api .
docker run --rm -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5433/impact \
  impact-api
```

## Project structure

```
src/main/java/com/uni/impact/
├── ImpactApplication.java         # Spring Boot entry point
├── application/                    # Volunteer applications to campaigns
├── attendance/                     # Per-day attendance records
├── auth/                           # Login / logout / register / me
├── campaign/                       # Campaigns (proposal → approval → ongoing)
├── campaign_photo/                 # Uploaded campaign photos
├── category/                       # Campaign categories
├── college/                        # Colleges (group users)
├── dashboard/                      # Aggregated stats endpoint
├── progress/                       # Campaign progress updates
├── user/                           # Students / staff
├── security/                       # Spring Security config + UserDetailsService
├── config/                         # JPA auditing, Swagger, datasource, web
└── util/                           # Shared types (NotFoundException, ...)
```

Each feature module follows the same pattern:
`<Entity>` (JPA) · `<Entity>Repository` · `<Entity>Service` · `<Entity>Controller` · `<Entity>Mapper` (MapStruct) · `<Entity>RequestDTO` / `<Entity>ResponseDTO`.

## Build & test

```bash
./mvnw clean verify
```

## API base path

All REST endpoints are versioned under `/api/v1/...` (e.g. `/api/v1/campaigns`, `/api/v1/applications`, `/api/v1/users`, `/api/v1/dashboard/stats`).
