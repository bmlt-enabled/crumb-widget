FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31-alpine3.23
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
