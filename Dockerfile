FROM debian:testing
MAINTAINER kotiesmit@gmail.com

# Install prerequisites
RUN apt-get update && \
  apt-get install -y --no-install-recommends less debian-keyring \
    debian-archive-keyring ca-certificates nodejs nodejs-legacy npm \
    build-essential git

# LaserWeb
RUN git clone --depth=1 https://github.com/LaserWeb/LaserWeb3.git
RUN cd LaserWeb3 && npm install

# Container config
EXPOSE 8000
WORKDIR /LaserWeb3
ENTRYPOINT nodejs server.js
