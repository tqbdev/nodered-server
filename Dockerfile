FROM nodered/node-red

ARG litestream_version="v0.3.9"
ARG litestream_binary_tgz_filename="litestream-${litestream_version}-linux-amd64-static.tar.gz"

# Copy package.json to the WORKDIR so npm builds all
# of your added nodes modules for Node-RED

USER root

COPY package.json .
RUN ["chown", "node-red:node-red", "package.json"]

USER node-red

RUN npm install --unsafe-perm --no-update-notifier --no-fund --only=production

USER root

COPY sqliteutil.js /data/sqliteutil.js
COPY sqlitestorage.js /data/sqlitestorage.js
COPY rediscontext.js /data/rediscontext.js
COPY settings.js /data/settings.js
COPY custom_package.json /data/package.json

RUN ["chown", "node-red:node-red", "/data/sqliteutil.js"]
RUN ["chown", "node-red:node-red", "/data/sqlitestorage.js"]
RUN ["chown", "node-red:node-red", "/data/rediscontext.js"]
RUN ["chown", "node-red:node-red", "/data/settings.js"]
RUN ["chown", "node-red:node-red", "/data/package.json"]

USER node-red
WORKDIR /data

RUN npm install --unsafe-perm --no-update-notifier --no-fund --only=production

USER root
WORKDIR /usr/src/node-red

RUN wget "https://github.com/benbjohnson/litestream/releases/download/${litestream_version}/${litestream_binary_tgz_filename}"
RUN tar -xvzf "${litestream_binary_tgz_filename}"
RUN rm "litestream-${litestream_version}-linux-amd64-static.tar.gz"

COPY docker_entrypoint ./docker_entrypoint
COPY litestream.yml /etc/litestream.yml

RUN ["chmod", "+x", "docker_entrypoint"]
RUN ["chown", "node-red:node-red", "litestream"]
RUN ["chown", "node-red:node-red", "docker_entrypoint"]

USER node-red
# Frequency that database snapshots are replicated.
ENV DB_SYNC_INTERVAL="1s"

ENTRYPOINT ["./docker_entrypoint"]