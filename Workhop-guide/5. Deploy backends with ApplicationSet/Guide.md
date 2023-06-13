# In the Guide we will Deploy all our backend applications with an ApplicationSet

## Part 1. Remove the backedn from the main kustomization.yaml

1. open the Deployment/kustomization.yaml file and remove the 3 backend resources from it, like following:

    ```yaml
    apiVersion: kustomize.config.k8s.io/v1beta1
    kind: Kustomization

    resources:
    - frontend


    configMapGenerator:
    - name: app-environment
    literals:
        - BACKEBD_PORT=9091
        - PORT=8080
        - HOST1=backend1
        - HOST2=backend2
        - HOST3=backend3
        - API_URL="Hello World"
    - name: app-config
    files:
    - frontend/conf/default.conf
    - frontend/conf/entrypoint.sh
    ```

    Now we are Going full GitOps with Kustomize, create the following folders under Deployment/Backend

    1. base
    2. layers

    ```bash
    Deployment
      |__backend
      |    |__base
      |    |__layers
    ```

    Now copy deployment.yaml, service.yaml, kustomization.yaml from folder "1" to the base folder and edit it as the following:

    1. remove the "1" from every name (change from backend1 to backend)
    2. replace the env from config map to env from value
    3. remove all lables from the deployment template and container in the deployment.yaml
    4. remove all lables and selectors from the service
    5. copy the folders 1, 2, 3 into the layers folder and leave only the kustomization.yaml file in them.

    the base/deployment.yaml file should look like this:

    ```YAML
    kind: Deployment
    apiVersion: apps/v1
    metadata:
    name: backend
    spec:
    replicas: 1
    selector:
        matchLabels:
    template:
        metadata:
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
            name: backend
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
                value: '9091'
            ports:
                - containerPort: 9091
                protocol: TCP
            imagePullPolicy: IfNotPresent
            terminationMessagePolicy: File
            image: 'quay.io/thason/hello-app:v4'
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

    the base/service.yaml file should look like this:

    ```YAML
    kind: Service
    apiVersion: v1
    metadata:
    name: backend
    labels:
    spec:
    ports:
        - name: 8080-tcp
        protocol: TCP
        port: 8080
        targetPort: 9091
    type: ClusterIP
    selector:
    ```

    the base/kustomization.yaml should look like this:

    ```YAML
    apiVersion: kustomize.config.k8s.io/v1beta1
    kind: Kustomization

    resources:
    - deployment.yaml
    - service.yaml
    ```

    in each layers/# (1, 2, 3) kustomization.yaml update the file as following

    for folder "1":

    ```YAML
    apiVersion: kustomize.config.k8s.io/v1beta1
    kind: Kustomization

    resources:
    - ../../base

    nameSuffix: '1'

    commonLabels:
        app: backend1
        app.kubernetes.io/component: backend1
        app.kubernetes.io/instance: backend1
        app.kubernetes.io/name: backend1
        app.kubernetes.io/part-of: api-workshop
        app.openshift.io/runtime: nodejs
    ```

    for folder "2":

    ```YAML
    apiVersion: kustomize.config.k8s.io/v1beta1
    kind: Kustomization


    resources:
    - ../../base

    nameSuffix: '2'

    commonLabels:
        app: backend2
        app.kubernetes.io/component: backend2
        app.kubernetes.io/instance: backend2
        app.kubernetes.io/name: backend2
        app.kubernetes.io/part-of: api-workshop
        app.openshift.io/runtime: nodejs
    ```

    for folder "3":

    ```YAML
    apiVersion: kustomize.config.k8s.io/v1beta1
    kind: Kustomization

    resources:
    - ../../base

    nameSuffix: '3'

    commonLabels:
        app: backend3
        app.kubernetes.io/component: backend3
        app.kubernetes.io/instance: backend3
        app.kubernetes.io/name: backend3
        app.kubernetes.io/part-of: api-workshop
        app.openshift.io/runtime: nodejs
    ```

2. add, commit and push the change.

3. refresh the argoCD application and check that the 3 backend deployments has been removed.

4. Create a new file name backend-appSet.yaml at the root of your git repo.

    > Git Generator: Directories
    > The Git directory generator, one of two subtypes of the Git generator, generates parameters using the directory structure of a specified Git repository.

    in the file create the following Argo ApplicationSet, with git directory generator: [link](https://argocd-applicationset.readthedocs.io/en/stable/Generators-Git/)

    ```YAML
    apiVersion: argoproj.io/v1alpha1
    kind: ApplicationSet
    metadata:
    name: backends-app
    namespace: user<<N>>-argocd
    spec:
    generators:
      - git:
          repoURL: <<Your Git Repo URL>>
          revision: <<Branch>>
          directories:
          - path: Deployment/Backend/layers/*
    template:
        metadata:
          name: 'backend-{{path.basename}}'
        spec:
          project: default
          source:
            repoURL: <<Your Git Repo URL>>
            targetRevision: <<Branch>>
            path: '{{path}}'
          destination:
            server: https://kubernetes.default.svc
            namespace: user<<N>>-application
          syncPolicy:
            automated:
              prune: true
              selfHeal: true
    ```

5. Login to the openshift console with your username. click on the + icon in the top right of the screen and paste the ApplicationSet YAML to the text box and click create. (you can also do it with oc apply -f ).

6. wait a few seconds and chack the argoCD UI if a new backend's application is now shown.

![ArgoUI](https://raw.githubusercontent.com/rhilconsultants/NGNIX-API-Gateway-Workshop/GitOps/artifacts/ApplicationSet.png)

