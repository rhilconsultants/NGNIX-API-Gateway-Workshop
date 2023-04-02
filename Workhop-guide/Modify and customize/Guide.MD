# In the Guide we will customize our deployment and add a 3rd backend service

## we will add the ngnix.conf and the entrypoint.sh files as Configmaps and mount them to the frontend

## we will add a 3rd backend and will added it to the relevnt locations

### stage 1. create 2 new config maps in the frontend deployment

1. Navigate to Deployemnt/frontend, create a folder named conf and copy the entrypoint.sh and conf/default.conf into it

2. Navigate to the kustomization file under deployment folder and edit it as following:

    ```YAML
    ...
    configMapGenerator:
    - name: app-environment
      literals:
        - BACKEBD_PORT=9091
        - PORT=8080
        - HOST1=backend1
        - HOST2=backend2
        - API_URL="Hello Red Hat!!!!!!!!"
    - name: app-config
      files:
      - frontend/conf/default.conf
      - frontend/conf/entrypoint.sh
    ...
    ```

    this will create 2 new configMaps in the namespace one for each file

3. mount the new configMap in the frontend/deployment.yaml file as following:

    ```YAML
    kind: Deployment
    apiVersion: apps/v1
    metadata:
      name: fronetend
    ...
    spec:
      ...
      template:
        ...
        spec:
          volumes:
          - name: app-config
            configMap:
              name: app-config
          containers:
            - name: ...
              volumeMounts:
                - name: app-config
                  mountPath: '/usr/share/nginx/html/config'
    ```

4. Now we need to fix our Container so it will run from the new path '/usr/share/nginx/html/config'

    a. Go to the frontend Dockerfile and update the file as following:

      ```Docker
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
      ENTRYPOINT ["/usr/share/nginx/html/config/entrypoint.sh"]
      CMD ["/bin/bash", "-c", "/usr/share/nginx/html/config/env.sh && nginx -g \"daemon off;\""]
      ```

    b. Go to the entrypoint.sh and fix the path for the scripit location 

      from this:

      ```Bash
      envsubst '\${HOST1} \${HOST2} \${PORT}' < /etc/nginx/default.conf > /etc/nginx/nginx.conf
      ```

      to this:

      ```Bash
      envsubst '\${HOST1} \${HOST2} \${PORT}' < /usr/share/nginx/html/config/default.conf > /etc/nginx/nginx.conf
      ```
