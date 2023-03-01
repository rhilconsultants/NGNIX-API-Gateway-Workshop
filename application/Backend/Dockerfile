# ---> Application Build Image
FROM registry.access.redhat.com/ubi8/nodejs-18:latest as builder

# Create app directory
WORKDIR /tmp

USER root
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY src/package*.json ./


# update the base image
RUN npm install && npm audit fix --force
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY src .

# ---> Appilcation run time image
FROM registry.access.redhat.com/ubi8/nodejs-18-minimal:latest

WORKDIR /tmp

COPY --from=builder /tmp .

USER 1001

EXPOSE 9091

CMD [ "node", "app.js" ]