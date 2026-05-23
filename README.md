# Impact — Volunteer Campaigns Platform

Backend service for a university volunteer-campaigns platform. Students apply to volunteering campaigns posted by colleges; staff approve, track progress, and record attendance.

## Tech Stack

- **Java 21** / **Spring Boot 4**
- **PostgreSQL 16** (via Docker)
- **Keycloak** (JWT OAuth2 resource server)
- **Spring Data JPA** + Hibernate
- **MapStruct** for DTO mapping, **Lombok** for boilerplate
- **springdoc-openapi** (Swagger UI)
- Maven (with `mvnw` wrapper)

## Prerequisites

- JDK 21
- Docker + Docker Compose
- A running Keycloak (for protected endpoints) — see [Keycloak setup](#keycloak-setup)

## Running locally

### 1. Start PostgreSQL

```bash
docker compose up -d postgresql
```

This starts Postgres on `localhost:5433` with database `impact` and user `postgres` / `P4ssword!`. It also runs `postgres/init/00-init-keycloak.sql` to provision a `keycloak` database for Keycloak's own use.

### 2. Start the app

```bash
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 3. Swagger UI

`http://localhost:8080/swagger-ui.html` (the OpenAPI JSON is at `/v3/api-docs`).

## Configuration

All settings live in `src/main/resources/application.yml` and can be overridden via environment variables:

| Variable                      | Default                                             | Purpose                       |
| ----------------------------- | --------------------------------------------------- | ----------------------------- |
| `SPRING_DATASOURCE_URL`       | `jdbc:postgresql://localhost:5433/impact`           | JDBC URL                      |
| `SPRING_DATASOURCE_USERNAME`  | `postgres`                                          | DB user                       |
| `SPRING_DATASOURCE_PASSWORD`  | `P4ssword!`                                         | DB password                   |
| `KEYCLOAK_ISSUER_URI`         | `http://localhost:8180/realms/impact`               | JWT issuer URI                |
| `KEYCLOAK_CLIENT_ID`          | `impact-app`                                        | Keycloak client / resource id |
| `KEYCLOAK_PRINCIPLE_ATTRIBUTE`| `preferred_username`                                | JWT claim used as principal   |
| `APP_UPLOAD_DIR`              | `uploads/photos`                                    | Directory for uploaded photos |

## Keycloak setup

A realm export is provided at `keycloak/imports/realm-export.json`. Run Keycloak alongside Postgres (port `8180` by default) and import the realm. The app expects a resource (client) whose name matches `KEYCLOAK_CLIENT_ID` and a role claim under `resource_access.<client>.roles`.

## Docker

A multi-stage `Dockerfile` is included. To build the app image:

```bash
docker build -t impact-api .
docker run --rm -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5433/impact \
  -e KEYCLOAK_ISSUER_URI=http://host.docker.internal:8180/realms/impact \
  impact-api
```

## Project structure

```
src/main/java/com/uni/impact/
├── ImpactApplication.java         # Spring Boot entry point
├── application/                    # Volunteer applications to campaigns
├── attendance/                     # Per-day attendance records
├── campaign/                       # Campaigns (proposal → approval → ongoing)
├── campaign_photo/                 # Uploaded campaign photos
├── category/                       # Campaign categories
├── college/                        # Colleges (group users)
├── dashboard/                      # Aggregated stats endpoint
├── progress/                       # Campaign progress updates
├── user/                           # Students / staff
├── security/                       # Spring Security + Keycloak JWT converter
├── config/                         # JPA auditing, CORS, Swagger, datasource
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
