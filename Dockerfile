FROM node:13-alpine

RUN apk add --no-cache python make g++

WORKDIR /usr/src/app

RUN npm install -g bunyan

COPY package*.json ./

RUN npm install && npm cache clean --force

COPY . .

EXPOSE 3000

RUN chmod 755 run.sh

CMD ["./run.sh"]
