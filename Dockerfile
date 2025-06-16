# Dockerfile
FROM node:20.10.0 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

FROM node:20.10.0

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./

RUN npm install --only=production

CMD ["node", "dist/main.js"]
