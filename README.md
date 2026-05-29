# Impact — Volunteer Campaigns Platform

A university volunteer-campaigns platform. Students apply to volunteering campaigns
posted by colleges; staff approve campaigns, track progress, and record attendance.
The repo contains both the **backend API** and the **admin dashboard frontend**, and
the whole stack (database + backend + frontend) runs from a single `docker compose`.

## Tech Stack

**Backend**
- Java 21 / Spring Boot 4
- PostgreSQL 16
- Spring Security (session-based login/logout, BCrypt passwords)
- Spring Data JPA + Hibernate
- MapStruct (DTO mapping) + Lombok
- springdoc-openapi (Swagger UI)

**Frontend** (`my-dashboard/`)
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router, TanStack Query, Zustand, Recharts, Axios
- Served as a static build via nginx in Docker

## Prerequisites

- Docker + Docker Compose (Docker Desktop on Windows/macOS)

## Run everything with Docker

```bash
docker compose up -d --build
```

This builds and starts three services:

| Service  | URL / Port                         | Notes                                  |
| -------- | ---------------------------------- | -------------------------------------- |
| frontend | http://localhost:5173              | Admin dashboard (nginx)                |
| backend  | http://localhost:8080              | REST API; Swagger at `/swagger-ui/index.html` |
| db       | localhost:5433 → 5432              | PostgreSQL 16, database `impact`       |

The frontend calls the backend directly at `http://localhost:8080/api/v1`.
Database data persists in the `postgres` Docker volume.

Common commands:

```bash
docker compose logs -f backend     # tail backend logs
docker compose down                # stop (keeps the DB volume)
docker compose down -v             # stop and WIPE the DB (forces a fresh re-seed)
```

## Seed data & default logins

On a **fresh/empty database** the backend seeds colleges, categories, users,
campaigns, applications, attendance and progress. A staff **admin** account is
always ensured (created if missing), so you can log in immediately:

| Account | Email                                         | Password      |
| ------- | --------------------------------------------- | ------------- |
| Admin   | `admin@impact.com`                            | `Admin@123`   |
| Student | `student1@impact.com` … `student12@impact.com`| `Student@123` |

> Student logins exist only after a fresh seed. To reload the full sample data,
> run `docker compose down -v && docker compose up -d`.

## Authentication

Session-based: after a successful `POST /api/v1/auth/login`, the server sets a
`JSESSIONID` cookie that the browser/SPA must send on subsequent requests
(`fetch(..., { credentials: 'include' })`). CORS already allows `http://localhost:*`
and `http://127.0.0.1:*` with credentials.

| Method | Path                    | Auth     | Description                 |
| ------ | ----------------------- | -------- | --------------------------- |
| POST   | `/api/v1/auth/register` | Public   | Create a new user account   |
| POST   | `/api/v1/auth/login`    | Public   | Log in, sets session cookie |
| POST   | `/api/v1/auth/logout`   | Required | Invalidate the session      |
| GET    | `/api/v1/auth/me`       | Required | Current authenticated user  |

All other `/api/v1/...` endpoints require an authenticated session (anonymous
requests get `401 Unauthorized`). Uploaded campaign photos are public under
`/uploads/photos/...`.

## Project structure

```
.
├── docker-compose.yml      # db + backend + frontend
├── Dockerfile              # backend image (Maven build → JRE)
├── pom.xml
├── src/main/java/com/uni/impact/
│   ├── application/        # volunteer applications to campaigns
│   ├── attendance/         # per-day attendance records
│   ├── auth/               # login / logout / register / me
│   ├── campaign/           # campaigns (proposal → approval → ongoing)
│   ├── campaign_photo/     # uploaded campaign photos
│   ├── category/           # campaign categories
│   ├── college/            # colleges (group users)
│   ├── dashboard/          # aggregated stats endpoint
│   ├── progress/           # campaign progress updates
│   ├── user/               # students / staff
│   ├── security/           # Spring Security + UserDetailsService
│   └── config/             # JPA auditing, Swagger, web, DataSeeder
└── my-dashboard/           # React + Vite admin dashboard
    ├── Dockerfile          # frontend image (Vite build → nginx)
    └── src/
        ├── API/            # axios instances + per-resource API modules
        ├── components/     # dashboard pages + layout (sidebar, toaster, …)
        ├── pages/          # Dashboard
        └── store/          # auth + toast (Zustand)
```

Each backend feature module follows the same pattern:
`<Entity>` (JPA) · `<Entity>Repository` · `<Entity>Service` · `<Entity>Controller` ·
`<Entity>Mapper` (MapStruct) · `<Entity>RequestDTO` / `<Entity>ResponseDTO`.

## Local development (without Docker)

```bash
# 1. start just the database
docker compose up -d db

# 2. backend (from repo root)
./mvnw spring-boot:run

# 3. frontend (from my-dashboard/)
npm install
npm run dev          # Vite dev server on http://localhost:5173
```

All REST endpoints are versioned under `/api/v1/...`
(e.g. `/api/v1/campaigns`, `/api/v1/applications`, `/api/v1/users`, `/api/v1/dashboard/stats`).
