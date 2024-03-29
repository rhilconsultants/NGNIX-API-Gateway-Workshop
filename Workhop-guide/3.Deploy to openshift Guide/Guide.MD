# In this Guide we will deploy our backend and frontend application to Openshift and see hou it interacts with the applications

## We will be using Kustomized to mamage the deployment configuration and ArgoCD to deploy to the cluster

1. build the Kustomazied folder structure, we will have 1 frontend deployment and 2 backend Deployments.

    use the following structure

    ```bash
    Deployment
      |__backend
      |    |__1
      |    |__2
      |__frontend
    ```

   a. Create the Deployment folder

    ```bash
    mkdir Deployment
    ```

    b. Create Backend folders inside the Deployment folder

    ```bash
    mkdir backend
    ```

    ```bash
    mkdir backend/1
    ```

    ```bash
    mkdir backend/2
    ```

    c. Create the frontend folder

    ```bash
    mkdir frontend
    ```

2. New we will create our Deployements and services YAML manifests for each Application

    a. Enter the frontend folder and create the following files:

      deployment.yaml

    ```YAML
    kind: Deployment
    apiVersion: apps/v1
    metadata:
      name: fronetend
      labels:
        app: fronetend
        app.kubernetes.io/component: fronetend
        app.kubernetes.io/instance: fronetend
        app.kubernetes.io/name: fronetend
        app.kubernetes.io/part-of: api-workshop
        app.openshift.io/runtime: nginx 
        app.openshift.io/runtime-namespace: api-workshop
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: fronetend
      template:
        metadata:
          labels:
            app: fronetend
            deployment: fronetend
        spec:
          containers:
            - resources:
                requests:
                  cpu: 150m
                  memory: 128Mi
                limits: {}
              readinessProbe:
                httpGet:
                  path: /probes/readiness
                  port: 8080
                  scheme: HTTP
                timeoutSeconds: 1
                periodSeconds: 10
                successThreshold: 1
                failureThreshold: 3
              terminationMessagePath: /dev/termination-log
              name: fronetend
              livenessProbe:
                httpGet:
                  path: /probes/liveness
                  port: 8080
                  scheme: HTTP
                timeoutSeconds: 1
                periodSeconds: 10
                successThreshold: 1
                failureThreshold: 3
              envFrom:
              - configMapRef:
                  name: app-environment
              ports:
                - containerPort: 8080
                  protocol: TCP
                - containerPort: 8443
                  protocol: TCP
              imagePullPolicy: IfNotPresent
              terminationMessagePolicy: File
             # Update with your image name
             image: 'quay.io/<<Your-Quay-User>>/<<Your-Image-Name>>:<<Your-image-Tag>>'
             #
          restartPolicy: Always
          terminationGracePeriodSeconds: 30
          dnsPolicy: ClusterFirst
          securityContext: {}
          schedulerName: default-scheduler
      strategy:
        type: RollingUpdate
        rollingUpdate:
          maxUnavailable: 25%
          maxSurge: 25%
      revisionHistoryLimit: 1
      progressDeadlineSeconds: 600
      ```

    service.yaml

    ```YAML
    kind: Service
    apiVersion: v1
    metadata:
      name: fronetend
      labels:
        app: fronetend
        app.kubernetes.io/component: fronetend
        app.kubernetes.io/instance: fronetend
        app.kubernetes.io/name: fronetend
        app.kubernetes.io/part-of: api-workshop
        app.openshift.io/runtime-version: v1
    spec:
      ports:
        - name: 8080-tcp
          protocol: TCP
          port: 8080
          targetPort: 8080
        - name: 8443-tcp
          protocol: TCP
          port: 8443
          targetPort: 8443
      type: ClusterIP
      selector:
        app: fronetend
        deployment: fronetend
    ```

    route.yaml

    ```YAML
    kind: Route
    apiVersion: route.openshift.io/v1
    metadata:
      name: fronetend
      labels:
        app: fronetend
        app.kubernetes.io/component: fronetend
        app.kubernetes.io/instance: fronetend
        app.kubernetes.io/name: fronetend
        app.kubernetes.io/part-of: api-workshop
        app.openshift.io/runtime-version: v1
    spec:
      to:
        kind: Service
        name: fronetend
        weight: 100
      port:
        targetPort: 8080-tcp
      wildcardPolicy: None
    ```

    and the kustomaized manifest for this folder kustomization.yaml

    ```YAML
    apiVersion: kustomize.config.k8s.io/v1beta1
    kind: Kustomization
    
    resources:
    - deployment.yaml
    - service.yaml
    - route.yaml
    ```

    b. Enter the backend/1 folder and create the following files:

      deployment.yaml

    ```YAML
    kind: Deployment
    apiVersion: apps/v1
    metadata:
      name: backend1
      labels:
        app: backend1
        app.kubernetes.io/component: backend1
        app.kubernetes.io/instance: backend1
        app.kubernetes.io/name: backend1
        app.kubernetes.io/part-of: api-workshop
        app.openshift.io/runtime: nodejs
        app.openshift.io/runtime-namespace: api-workshop
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: backend1
      template:
        metadata:
          labels:
            app: backend1
            deployment: backend1
        spec:
          containers:
            - resources:
                requests:
                  cpu: 150m
                  memory: 128Mi
                limits: {}
              readinessProbe:
                httpGet:
                  path: /health/readiness
                  port: 9091
                  scheme: HTTP
                timeoutSeconds: 1
                periodSeconds: 10
                successThreshold: 1
                failureThreshold: 3
              terminationMessagePath: /dev/termination-log
              name: backend1
              livenessProbe:
                httpGet:
                  path: /health/liveliness
                  port: 9091
                  scheme: HTTP
                timeoutSeconds: 1
                periodSeconds: 10
                successThreshold: 1
                failureThreshold: 3
              env:
                - name: PORT
                  valueFrom:
                    configMapKeyRef:
                      name: app-environment
                      key: BACKEBD_PORT
              ports:
                - containerPort: 9091
                  protocol: TCP
              imagePullPolicy: IfNotPresent
              terminationMessagePolicy: File
             # Update with your image name
             image: 'quay.io/<<Your-Quay-User>>/<<Your-Image-Name>>:<<Your-image-Tag>>'
             #
          restartPolicy: Always
          terminationGracePeriodSeconds: 30
          dnsPolicy: ClusterFirst
          securityContext: {}
          schedulerName: default-scheduler
      strategy:
        type: RollingUpdate
        rollingUpdate:
          maxUnavailable: 25%
          maxSurge: 25%
      revisionHistoryLimit: 1
      progressDeadlineSeconds: 600
      ```

    service.yaml

    ```YAML
    kind: Service
    apiVersion: v1
    metadata:
      name: backend1
      labels:
        app: backend1
        app.kubernetes.io/component: backend1
        app.kubernetes.io/instance: backend1
        app.kubernetes.io/name: backend1
        app.kubernetes.io/part-of: api-workshop
        app.openshift.io/runtime-version: v1
    spec:
      ports:
        - name: 8080-tcp
          protocol: TCP
          port: 8080
          targetPort: 9091
      type: ClusterIP
      selector:
        app: backend1
        deployment: backend1
    ```

    kustomization.yaml

    ```YAML
    apiVersion: kustomize.config.k8s.io/v1beta1
    kind: Kustomization
    
    resources:
    - deployment.yaml
    - Service.yaml
    ```

    c. Enter the backend/2 folder and create the following files:

    deployment.yaml

    ```YAML
    kind: Deployment
    apiVersion: apps/v1
    metadata:
      name: backend2
      labels:
        app: backend2
        app.kubernetes.io/component: backend2
        app.kubernetes.io/instance: backend2
        app.kubernetes.io/name: backend2
        app.kubernetes.io/part-of: api-workshop
        app.openshift.io/runtime: nodejs
        app.openshift.io/runtime-namespace: api-workshop
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: backend2
      template:
        metadata:
          labels:
            app: backend2
            deployment: backend2
        spec:
          containers:
            - resources:
                requests:
                  cpu: 150m
                  memory: 128Mi
                limits: {}
              readinessProbe:
                httpGet:
                  path: /health/readiness
                  port: 9091
                  scheme: HTTP
                timeoutSeconds: 1
                periodSeconds: 10
                successThreshold: 1
                failureThreshold: 3
              terminationMessagePath: /dev/termination-log
              name: backend2
              livenessProbe:
                httpGet:
                  path: /health/liveliness
                  port: 9091
                  scheme: HTTP
                timeoutSeconds: 1
                periodSeconds: 10
                successThreshold: 1
                failureThreshold: 3
              env:
                - name: PORT
                  valueFrom:
                    configMapKeyRef:
                      name: app-environment
                      key: BACKEBD_PORT
              ports:
                - containerPort: 8080
                  protocol: TCP
              imagePullPolicy: IfNotPresent
              terminationMessagePolicy: File
              # Update with your image name
              image: 'quay.io/<<Your-Quay-User>>/<<Your-Image-Name>>:<<Your-image-Tag>>'
              #
          restartPolicy: Always
          terminationGracePeriodSeconds: 30
          dnsPolicy: ClusterFirst
          securityContext: {}
          schedulerName: default-scheduler
      strategy:
        type: RollingUpdate
        rollingUpdate:
          maxUnavailable: 25%
          maxSurge: 25%
      revisionHistoryLimit: 1
      progressDeadlineSeconds: 600
    ```

    service.yaml

    ```YAML
    kind: Service
    apiVersion: v1
    metadata:
      name: backend2
      labels:
        app: backend2
        app.kubernetes.io/component: backend2
        app.kubernetes.io/instance: backend2
        app.kubernetes.io/name: backend2
        app.kubernetes.io/part-of: api-workshop
        app.openshift.io/runtime-version: v1
    spec:
      ports:
        - name: 8080-tcp
          protocol: TCP
          port: 8080
          targetPort: 9091
      type: ClusterIP
      selector:
        app: backend2
        deployment: backend2
    ```

    kustomization.yaml

    ```YAML
    apiVersion: kustomize.config.k8s.io/v1beta1
    kind: Kustomization
    
    resources:
    - deployment.yaml
    - service.yaml
    ```

    d. Go back to the Deployment folder and create the following files:

    kustomization.yaml

    ```YAML
    apiVersion: kustomize.config.k8s.io/v1beta1
    kind: Kustomization
    
    resources:
    - Backend/1
    - Backend/2
    - frontend

    
    configMapGenerator:
    - name: app-environment
      literals:
        - BACKEBD_PORT=9091
        - PORT=8080
        - HOST1=backend1
        - HOST2=backend2
        - API_URL="Hello World"
    ```

    Now we have created a full application deployment from a single entrypoint folder.

3. Deploy application to Openshift Cluster via ArgoCD

    a. go to your argoCD instance and click "+ NEW APP"

    b. Fill the form as with the following:

      * project - default
      * repoURL -  << Your GitHub Repo >>
      * path -  The folder where the main kustomization file located
      * targetRevision - Your Working Branch
      * 'server: 'https://kubernetes.default.svc'
      * 'namespace: user<<N>>-application'
  
    c. Click "create", and wait for the argoCD to create it resources.

    d. wait for all application object will sync successfully, there should be a green Hart 💚 and a green check ✅ next to all objects.

    e. Go back to the Openshift console, Developer Perspective --> Topology and access the frontend application route

    ![running app](https://raw.githubusercontent.com/rhilconsultants/NGNIX-API-Gateway-Workshop/GitOps/artifacts/Running-application.png)

    f. test the "Test backend 1" link to see that is able to access the backend server and also "Test backend 2"
    to see that everything is working.

## Congratulations You now have a working Applicaiton on the cluster

### Move over to Step 4
