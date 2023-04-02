# In the Guide we will customize our deployment and add a 3rd backend service

## we will add the ngnix.conf and the entrypoint.sh files as Configmaps and mount them to the frontend

## we will add a 3rd backend and will added it to the relevnt locations

### stage 1. create 2 new config maps in the frontend deployment.

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
    - name: nginx-config
      files:
      - frontend/conf/default.conf
    - name: entrypoint
      files:
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
          - name: nginx-config
            configMap:
              name: nginx-config
          - name: entrypoint
            configMap:
              name: entrypoint
              items:
                - key: entrypoint.sh
                  path: entrypoint.sh
          containers:
            - name: ...
              volumeMounts:
                - name: nginx-config
                  mountPath: '/usr/share/nginx/html/entrypoint.sh'
                - name: entrypoint
                  mountPath: '/usr/share/nginx/html/env.sh'
