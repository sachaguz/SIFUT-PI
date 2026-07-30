# Builds the admin panel by exporting the mobile app's own Admin screens
# (React Native + React Navigation) to a static web bundle via
# react-native-web, instead of maintaining a separate hand-rolled UI.
# Build context is the repo root (see docker-compose.yml) since the RN
# app lives there, not inside admin-panel/.
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY App.js index.js app.json ./
COPY assets ./assets
COPY src ./src

RUN npx expo export --platform web

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY admin-panel/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
