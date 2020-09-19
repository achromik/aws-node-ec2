FROM node:14-alpine as build

ARG REACT_APP_SERVICES_HOST=/api/v1

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package*.json ./

RUN npm ci --silent

COPY . .

RUN npm run build

# production environment
FROM nginx:stable-alpine

COPY --from=build /usr/src/app/build /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
