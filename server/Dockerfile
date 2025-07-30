FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

# Starte die App mit app.js
CMD ["node", "app.js"]

