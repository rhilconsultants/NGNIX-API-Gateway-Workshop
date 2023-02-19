# => Build container
FROM registry.access.redhat.com/ubi8/nodejs-14:latest as builder
USER root
RUN npm install --global yarn
WORKDIR /app
COPY package.json .
#COPY yarn.lock .
RUN yarn
COPY . .
RUN yarn build

# => Run container
FROM registry.access.redhat.com/ubi8/nginx-120:latest
USER root
# Nginx config

COPY conf/conf.d/default.conf  /etc/nginx/

# Static build
COPY --from=builder /app/build /usr/share/nginx/html/

# Default port exposure
EXPOSE 8080

# Copy .env file and shell script to container
WORKDIR /usr/share/nginx/html
COPY ./env.sh .
COPY .env .
COPY entrypoint.sh .
COPY *.ico .


# Make our shell script executable
RUN chmod 775 env.sh env-config.js entrypoint.sh && \
    chgrp -R 0 /usr/share/nginx/html && \
    chmod -R g=u /usr/share/nginx/html && \
    chown -R 1001:0 /usr/share/nginx/html

ENV API_URL From_the_Dockerfile

ENV HOST1 172.27.193.116
ENV HOST2 172.27.193.116
ENV PORT 9090

USER 1001
# Start Nginx server
ENTRYPOINT ["/usr/share/nginx/html/entrypoint.sh"]
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]

 #"/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""