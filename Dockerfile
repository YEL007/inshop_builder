# Stage 1 — Build frontend with Vite
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2 — Nginx serves the built files and proxies to Django
FROM nginx:1.25-alpine
RUN apk add --no-cache gettext
# Place template in /etc/nginx/templates/ — nginx Docker entrypoint runs envsubst at startup
COPY nginx/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=frontend /app/dist /usr/share/nginx/html
