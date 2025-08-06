FROM node:18

WORKDIR /app

RUN apt-get update && \
    apt-get install -y \
    fping \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
