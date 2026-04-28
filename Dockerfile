# Stage 1: Build Angular
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .
RUN npx ng build --configuration=qas

# Stage 2: Nginx para servir la app
FROM nginx:alpine
COPY --from=build /app/dist/sistema_gestion_front/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
