ARG NODE_VER=lts

FROM node:${NODE_VER}-alpine as build

WORKDIR /app

COPY ../package*.json .
COPY client/package*.json client/
COPY server/package*.json server/
RUN npm ci

COPY . .

# If we want to have custom env variables passed to the client build
# we would need to set them here as build args.
# ARG VITE_MY_CUSTOM_FRONT_END_ENV_VARIABLE

WORKDIR /app/client

RUN npm run build

FROM nginx:1.27-alpine as nginx

# Delete the default welcome page.
RUN rm /usr/share/nginx/html/* -rf

COPY --from=build /app/client/dist /usr/share/nginx/html

ENV NGINX_ENVSUBST_OUTPUT_DIR '/etc/nginx/conf.d'

COPY client/nginx/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
