FROM node:14.4-alpine

ENV NODE_ENV=production
ENV NODE_PATH=/app/node_modules
ENV PATH=/app/node_modules/.bin:$PATH

# https://github.com/Automattic/node-canvas/issues/1486
# https://stackoverflow.com/questions/57088230/node-canvas-on-alpine-within-docker
RUN apk --no-cache --virtual .dependencies add python make build-base g++ cairo-dev pango-dev jpeg-dev giflib-dev pixman-dev
RUN npm install --quiet node-gyp

# RUN apk --no-cache --virtual .dependencies add python make g++
# RUN npm install --quiet node-gyp

WORKDIR /app
COPY package.json /tmp/
RUN cd /tmp && npm install
RUN cp -a /tmp/node_modules /app

RUN apk del .dependencies

COPY . .

CMD [ "npm", "run", "start:prod" ]
