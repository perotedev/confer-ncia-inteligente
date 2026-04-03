# ── Stage 1: Build do React/Vite ─────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL vazio = frontend usa URLs relativas (/api, /socket.io)
# o Nginx faz o proxy para os backends internos
RUN npm run build

# ── Stage 2: Nginx servindo os arquivos estáticos ─────────────
FROM nginx:alpine

# Copia o build do React
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a configuração unificada (frontend + proxy backend)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
