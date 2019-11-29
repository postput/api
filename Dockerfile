FROM node:12-stretch-slim

ENV FFMPEG_VERSION=4.2.1 \
    LISTENING_PORT=3000 \
    INSPECT_PORT=9229

RUN apt-get update && apt-get install --force-yes -yy \
  libjemalloc1 \
  && rm -rf /var/lib/apt/lists/*

# Change memory allocator to avoid leaks
ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.1

WORKDIR /opt/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE ${LISTENING_PORT}
EXPOSE ${INSPECT_PORT}

CMD [ "npm", "start" ]
