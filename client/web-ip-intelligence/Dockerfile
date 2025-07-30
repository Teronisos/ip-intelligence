# client/web-ip-intelligence/Dockerfile

FROM node:18 as build

WORKDIR /app

# Kopiere nur das, was nötig ist für install
COPY package*.json ./
RUN npm install

# Jetzt den Rest (inkl. .env!)
COPY . .

# Jetzt wird die .env eingelesen!
RUN npm run build

# Build-Ergebnis über NGINX ausliefern
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
