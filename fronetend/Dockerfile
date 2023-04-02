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
RUN mkdir /usr/share/nginx/html/config
COPY conf/default.conf  /usr/share/nginx/html/config
        
# Static build
COPY --from=builder /app/build /usr/share/nginx/html/
        
# Default port exposure
EXPOSE 8080
        
# Copy .env file and shell script to container
WORKDIR /usr/share/nginx/html
COPY ./env.sh .
COPY .env .
COPY entrypoint.sh config/
COPY *.ico .
        
        
# Make our shell script executable
RUN chmod 775 env.sh env-config.js config/entrypoint.sh && \
    chgrp -R 0 /usr/share/nginx/html && \
    chmod -R g=u /usr/share/nginx/html && \
    chown -R 1001:0 /usr/share/nginx/html && \
    chgrp -R 0 /usr/share/nginx/html/config && \
    chmod -R g=u /usr/share/nginx/html/config && \
    chown -R 1001:0 /usr/share/nginx/html/config
        
ENV API_URL From_the_Dockerfile
        
ENV HOST1 172.27.193.116
ENV HOST2 172.27.193.116
ENV PORT 9090
        
USER 1001
# Start Nginx server
ENTRYPOINT ["/usr/share/nginx/html/config/entrypoint.sh"]
CMD ["/bin/bash", "-c", "./env.sh && nginx -g \"daemon off;\""]