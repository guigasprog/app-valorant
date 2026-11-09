# ── 1. build do Angular ─────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration production

# ── 2. nginx servindo o build e repassando /api para o container da API ─────
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/client/browser /usr/share/nginx/html
EXPOSE 80
