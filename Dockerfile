# BUILD IMAGE
FROM node:12-alpine as build
RUN apk update && apk upgrade && \
  apk add --no-cache --virtual build-dependencies python && \
  apk add --update alpine-sdk && \
  mkdir -p /home/node/app && \
  chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node . .

ENV NODE_ENV development

RUN npm install npm@latest -g

USER node

WORKDIR /home/node/app
RUN npm run install && npm run build-client

WORKDIR /home/node/app/server
RUN npm prune --production

# CREATE IMAGE
FROM node:12-alpine
RUN apk update && apk upgrade && \
  mkdir -p /home/node/app/server && \
  mkdir -p /home/node/app/client/dist && \
  mkdir -p /home/node/app/docs && \
  chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --from=build --chown=node:node /home/node/app/server ./server
COPY --from=build --chown=node:node /home/node/app/client/dist ./client/dist

ENV NODE_ENV production

USER node

EXPOSE 3000

CMD cd server && node index.js