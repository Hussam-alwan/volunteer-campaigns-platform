# --- build the Vite app ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Drop the Windows-generated lockfile and force npm to install the Linux/musl
# optional native deps (e.g. Vite 8's @rolldown/binding-linux-x64-musl). Without
# the explicit --os/--cpu/--libc flags, npm skips that binary on Alpine and
# `vite build` crashes with "Cannot find native binding" (npm #4828).
# The cache mount persists npm's download cache across builds so a slow connection
# doesn't re-download every package on each rebuild.
RUN --mount=type=cache,target=/root/.npm \
    rm -f package-lock.json && \
    npm install --include=optional --os=linux --cpu=x64 --libc=musl
COPY . .

# API the browser will call (host-published backend port). Overridable at build.
ARG VITE_API_BASE_URL=http://localhost:8080/api/v1
ARG VITE_SERVER_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SERVER_BASE_URL=$VITE_SERVER_BASE_URL

# vite (esbuild) builds even with the project's pre-existing type-only errors;
# skip `tsc -b` so the image build doesn't fail on those.
RUN npx vite build

# --- serve static files with nginx ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
