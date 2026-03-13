FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install -g @quasar/cli

RUN npm ci

ARG VITE_OWM_API_KEY
ARG VITE_OWM_BASE_URL

ENV VITE_OWM_API_KEY=$VITE_OWM_API_KEY
ENV VITE_OWM_BASE_URL=$VITE_OWM_BASE_URL

RUN quasar build

FROM nginx:1.25-alpine AS server

COPY --from=builder /app/dist/spa /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]