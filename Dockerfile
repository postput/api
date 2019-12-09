FROM node:12-stretch-slim

ENV FFMPEG_VERSION=4.2.1 \
    LISTENING_PORT=3000 \
    INSPECT_PORT=9229

WORKDIR /tmp
# Install FFMPEG
RUN echo "deb http://www.deb-multimedia.org stretch main non-free" >> /etc/apt/sources.list
RUN apt-get update -y --force-yes && \
    apt-get install -y  --force-yes deb-multimedia-keyring libjemalloc1 && \
    apt-get update -y --force-yes && \
    apt-get install -y --force-yes \
                                        build-essential \
                                        libmp3lame-dev \
                                        libvorbis-dev \
                                         libtheora-dev \
                                         libspeex-dev \
                                         yasm \
                                         pkg-config \
                                         libass-dev \
                                         libopus-dev \
                                         libfdk-aac-dev \
                                         libvpx-dev \
                                         libx265-dev \
                                         libx264-dev \
                                         tar \
                                         wget && \
    rm -rf /var/lib/apt/lists/* && \
    wget https://ffmpeg.org/releases/ffmpeg-${FFMPEG_VERSION}.tar.bz2 -O ffmpeg.tar.bz2 && \
    tar xvjf ffmpeg.tar.bz2

ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.1

WORKDIR /tmp/ffmpeg-${FFMPEG_VERSION}
RUN ./configure \
            --prefix=/usr    \
            --enable-gpl         \
            --enable-version3    \
            --enable-nonfree     \
            --disable-static     \
            --enable-shared      \
            --disable-debug      \
            --enable-libass      \
            --enable-libfdk-aac  \
            --enable-libfreetype \
            --enable-libmp3lame  \
            --enable-libopus     \
            --enable-libtheora   \
            --enable-libvorbis   \
            --enable-libvpx      \
            --enable-libx264     \
            --enable-libx265     && \
    make -j 16 && \
    make install

WORKDIR /opt/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE ${LISTENING_PORT}
EXPOSE ${INSPECT_PORT}

CMD [ "npm", "start" ]
