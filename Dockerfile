# Stage 1 — Build frontend with Vite
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2 — Nginx serves the built files
FROM nginx:1.25-alpine
# Install envsubst for template processing
RUN apk add --no-cache gettext
COPY nginx/nginx.conf.template /etc/nginx/conf.d/default.conf.template
RUN envsubst '${ALLOWED_ORIGIN}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
COPY --from=frontend /app/dist /usr/share/nginx/html
