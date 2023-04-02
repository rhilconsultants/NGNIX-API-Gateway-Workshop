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
              defaultMode: 509  #This change the premissions for the mounted files
          containers:
            - name: ...
              volumeMounts:
                - name: app-config
                  mountPath: '/usr/share/nginx/html/config' #the location where the files will be mounted
    ```

4. Now we need to fix our Container so it will run from the new path '/usr/share/nginx/html/config'

    a. Go to the frontend Dockerfile and update the file as following:

      ```Docker
      # => Build container
      FROM registry.access.redhat.com/ubi8/nodejs-14:latest as builde
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
      ```

    b. Go to the entrypoint.sh and fix the path for the scripit location:

      from this:

      ```Bash
      envsubst '\${HOST1} \${HOST2} \${PORT}' < /etc/nginx/default.conf > /etc/nginx/nginx.conf
      ```

      to this:

      ```Bash
      envsubst '\${HOST1} \${HOST2} \${PORT}' < /usr/share/nginx/html/config/default.conf > /etc/nginx/nginx.conf
      ```

    c. build and push a new image for the frontend application.

      build-image:

      ```Bash
      docker build . -t quay.io/<user-name>/frontend-app:v2
      ```

      push-image:

      ```Bash
      docker push quay.io/<user-name>/frontend-app:v2
      ```

    d. update the frontend/deployment.yaml file with the new image and tag and refresh the ArgoCD application.

### stage 2. Add a 3rd backend service

#### here i will only tell you what to do without any samples

1. Navigate to Deplyment/backend, copy and paste folder 1 and rename it folder 3.

2. replace in the new folder 3 files from "backend2" to "backend3" so we have a new deployment.

3. Navigate to Deployment/kustomization.yaml and add the new backend/3 folder under resources.

4. add, commit and push the new changes.

5. refresh the ArgoCD Application and see that backend 3 is deployed to the cluster.

6. Now add a new Link to the app.js file of the react applicaion and build the new image.

7. update the new image in the deployment/frontend/deployment.yaml with the new image & tag

8. update the Deployment/frontend/conf/default.conf, Deployment/frontend/conf/entrypoint.sh with $HOST3 and add the HOST3 and it's service name to the deployment/Kustomization.yaml file.

9. add, commit and push the changes to the git, go and refresh the argoCD application.

## Congratulations You have finish the Workshop
