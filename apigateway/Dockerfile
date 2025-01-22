FROM node:22.11.0
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY code/package*.json ./code/

WORKDIR /usr/src/app/code

RUN npm install

WORKDIR /usr/src/app

COPY code .

WORKDIR /usr/src/app/code

CMD ["npm", "run", "dev"]