#!/bin/bash

set -eu

echo "update ngnix config"
envsubst '\${HOST1} \${HOST2} \${PORT}' < /etc/nginx/default.conf > /etc/nginx/nginx.conf

exec "$@"