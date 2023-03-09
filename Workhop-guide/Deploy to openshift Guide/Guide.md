# In this Guide we will deploy our backend and frontend application to Openshift and see hou it interacts with the applications #

## We will be using Kustomized to mamage the deployment configuration and ArgoCD to deploy to the cluster ##

1. build the Kustomazied folder structure, we will have 1 frontend deployment and 2 backend Deployments.

    use the following structure
    Deployment
      |__Backend
      |    |__1
      |    |__2
      |__Frontend

   a. Create the Deployment folder

        mkdir Deployment

    b. Create Backend folders inside the Deployment folder

        mkdir Backend

        mkdir Backend/1

        mkdir Backend/2

    c. Create the frontend folder

        mkdir frontend

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
                  image: 'quay.io/<UserName>/react-app:v1'
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
        - Deployment.yaml
        - Service.yaml
        - Route.yaml
        ```
