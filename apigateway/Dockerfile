FROM node:22.11.0

WORKDIR /usr/src/app

COPY code/package*.json ./code/

WORKDIR /usr/src/app/code
RUN npm install

COPY code/ ./code/

WORKDIR /usr/src/app/code

CMD ["npm", "run", "dev"]