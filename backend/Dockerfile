FROM node:14-alpine

RUN apk add --no-cache python make g++ bash

WORKDIR /usr/src/app

RUN npm install -g bunyan

COPY package*.json ./

RUN npm install --production  && npm cache clean --force

COPY . .

EXPOSE 3000

RUN chmod 755 run.sh

ENTRYPOINT [ "./run.sh" ]
