# docker build command:
# docker build --build-arg NODE_VER=$(cat ../.nvmrc) -t tick-it-off-server . -t foo --platform linux/amd64
# get images: docker image ls
# run image detached: docker run -dp 3000:3000 <image_id>

ARG NODE_VER=22

FROM node:${NODE_VER}-alpine

WORKDIR /app

COPY . ./

RUN npm install

CMD ["npm", "run", "dev"]
