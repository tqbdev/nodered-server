FROM nodered/node-red

ARG litestream_version="v0.3.9"
ARG litestream_binary_tgz_filename="litestream-${litestream_version}-linux-amd64-static.tar.gz"

# Copy package.json to the WORKDIR so npm builds all
# of your added nodes modules for Node-RED
COPY package.json .
RUN npm install --unsafe-perm --no-update-notifier --no-fund --only=production

COPY sqliteutil.js /data/sqliteutil.js
COPY sqlitestorage.js /data/sqlitestorage.js
COPY rediscontext.js /data/rediscontext.js
COPY settings.js /data/settings.js

RUN wget "https://github.com/benbjohnson/litestream/releases/download/${litestream_version}/${litestream_binary_tgz_filename}"
RUN tar -xvzf "${litestream_binary_tgz_filename}"
RUN rm "litestream-${litestream_version}-linux-amd64-static.tar.gz"

COPY docker_entrypoint ./docker_entrypoint
COPY litestream.yml /etc/litestream.yml

USER root
RUN ["chmod", "+x", "docker_entrypoint"]

# Frequency that database snapshots are replicated.
ENV DB_SYNC_INTERVAL="1s"

ENTRYPOINT ["./docker_entrypoint"]