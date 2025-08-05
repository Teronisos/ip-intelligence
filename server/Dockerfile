FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Starte die App mit app.js
CMD ["node", "app.js"]

