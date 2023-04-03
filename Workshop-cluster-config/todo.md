## add cluster admin to the ArgoCD ServiceAccount

```Bash
oc adm policy add-cluster-role-to-user cluster-admin system:serviceaccount:openshift-gitops:openshift-gitops-argocd-application-controller
```

## add user role "admin" to User work namespaces for each user

```Bash
oc adm policy add-role-to-user admin user{n} -n user{n}-argocd
oc adm policy add-role-to-user admin user{n}} -n user{n}-application
```

## to create a new user layer navigate to Openshift-GitOps->user-helm-template, and run the following command

```Bash
helm template new-user . --set userName=user{n} --output-dir user{n}}
```
1. the --set will update all the tempalte with the new user number
2. the --output-dir will output the files in to a new dirctory.
3. the output folder is then filled with 2 new sub folders "user-tempalte/templates"
4. cut all the YAML files form the templates to the user{n} folder and delete those folders
5. copy the new folder to the ArgoCD-instancs/layers folder to created a new user work env.
