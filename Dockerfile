FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

WORKDIR /app/order-management-system

RUN npm run build && ls -R dist

EXPOSE 3000

CMD ["node", "dist/main"]
