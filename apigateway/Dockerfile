FROM node:22.11.0
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY code/package.json ./
RUN npm install

COPY . .
