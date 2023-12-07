# Part 2 of NGINX Gateway #

## Build a REACT frontend service the is served by NGNIX Server and Proxy Pass Configuration ##

1. Create a new react application via cli

   ```bash
   npx create-react-app fronetend
   cd fronetend
   ```

   and wait for the installation to finish

2. Create a new file named .env in the frontend application

    ```bash
    touch .env
    ```

    and copy the following content in the to file

    ```env
    API_URL=localhost
    HOSTNAME=my_host_name
    ```

3. create a new file named env.sh.
   Then let’s write a small bash script which will read.env file and extract environment variables that will be written into the file. If you set an environment variable inside the container, its value will be used, otherwise, it will fall back to the default value from .env file. It will create a JavaScript file which puts environment variable values as an object which is assigned as a property of window object.

   ```bash
   #!/bin/bash

   # (1) Recreate config file 
   rm -rf ./env-config.js
   touch ./env-config.js
   
   # (2) Add assignment 
   echo "window._env_ = {" >> ./env-config.js
   
   # (3) Read each line in .env file
   # Each line represents key=value pairs
   while read -r line || [[ -n "$line" ]];
   do
     # (4) Split env variables by character `=`
     if printf '%s\n' "$line" | grep -q -e '='; then
       varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
       varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
     fi
   
     # Read value of current variable if exists as Environment variable
     value=$(printf '%s\n' "${!varname}")
     # Otherwise use value from .env file
     [[ -z $value ]] && value=${varvalue}
     
     # (5) Append configuration property to JS file
     echo "  $varname: \"$value\"," >> ./env-config.js
   done < .env
   
   # (6)
   echo "}" >> ./env-config.js
   ```

   Explaination:
   env.sh –
  1. Removes the old file, and creates a new one.
  2. Write JS code which opens object literal and assigns it to the global window object.
  3. Reads each line of .env file and splits into key/value pair.
  4. Look for the environment variable, if set, use its value, otherwise, use the default value from .env file.
  5. Append it to object that we assigned to global window object.
  6. Close object literal.

4. We must add the following line to the "< head >" element inside index.htmlwhich then imports the file created by our bash script.

   ```html
   <script src="%PUBLIC_URL%/env-config.js"></script>
   ```

   the full file will look like this:

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="utf-8" />
       <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
       <meta name="viewport" content="width=device-width, initial-scale=1" />
       <meta name="theme-color" content="#000000" />
       <meta
         name="description"
         content="Web site created using create-react-app"
       />
       <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
       <!--
         manifest.json provides metadata used when your web app is installed on a
         user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
       -->
       <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
       <!--
         Notice the use of %PUBLIC_URL% in the tags above.
         It will be replaced with the URL of the `public` folder during the build.
         Only files inside the `public` folder can be referenced from the HTML.
         Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
         work correctly both with client-side routing and a non-root public URL.
         Learn how to configure a non-root public URL by running `npm run build`.
       -->
       <script src="%PUBLIC_URL%/env-config.js"></script>
       <title>React App</title>
     </head>
     <body>
       <noscript>You need to enable JavaScript to run this app.</noscript>
       <div id="root"></div>
       <!--
         This HTML file is a template.
         If you open it directly in the browser, you will see an empty page.
         You can add webfonts, meta tags, or analytics to this file.
         The build step will place the bundled scripts into the <body> tag.
         To begin the development, run `npm start` or `yarn start`.
         To create a production bundle, use `npm run build` or `yarn build`.
       -->
     </body>
   </html>
   ```

5. Now let's edit app.js, the file should look as following:

    ```js
    import { useEffect, useState } from "react";
    import logo from './logo.svg';
    import './App.css';
    
    
    
    function App(_res,_req) {
      const [title] = useState(`${window._env_.API_URL}`);
      useEffect(() => {
        // This will run when the page first loads and whenever the title changes
        document.title = title;
      },
      [title]);
      return (   
        <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Message: {window._env_.API_URL}
              </p>
              <p>
                HOST: {window._env_.HOSTNAME}
              </p>
              <a
                className="link"
                href="/backend1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Test backend 1
              </a>
              <a
                className="link"
                href="/backend2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Test backend 2
              </a>
            </header>
          </div>
      );
    }
    
    export default App;
    ```

    **Make sure you are editing the files in the correct location index.html under public and app.js under src**

6. edit the "package.json" with the following chagnes

    ```json
    {
      "name": "frontend",
      "version": "0.1.0",
      "private": true,
      "dependencies": {
        "@testing-library/jest-dom": "^5.16.5",
        "@testing-library/react": "^13.4.0",
        "@testing-library/user-event": "^13.5.0",
        "express": "^4.18.2",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-scripts": "5.0.1",
        "web-vitals": "^2.1.4"
      },
      "scripts": {
        "start": "chmod +x ./env.sh && ./env.sh && cp env-config.js ./public/ && react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
      },
      "eslintConfig": {
        "extends": [
          "react-app",
          "react-app/jest"
        ]
      },
      "browserslist": {
        "production": [
          ">0.2%",
          "not dead",
          "not op_mini all"
        ],
        "development": [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version"
        ]
      }
    }
    ```

    this will allow us to test the script local outside of the container

7. replace logo.svg with the image in this link in the src folder
    [logo.svg](https://raw.githubusercontent.com/rhilconsultants/NGNIX-API-Gateway-Workshop/GitOps/application/frontend/src/logo.svg)

8. add the followiing ico to the frontend folder
    [icon](https://raw.githubusercontent.com/rhilconsultants/NGNIX-API-Gateway-Workshop/GitOps/application/frontend/favicon.ico)

9. Now test locally our application

    ```bash
    yarn start
    ```

    we should see the following web page
    ![Web page](https://raw.githubusercontent.com/rhilconsultants/NGNIX-API-Gateway-Workshop/GitOps/artifacts/web-local.png)

10. if everything worked successfully we now can start building our Container image.

    a. create a Dockerfile in the frontend folder

      ```Dockerfile
      # => Build container
      FROM registry.access.redhat.com/ubi8/nodejs-16:latest as builder
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
      
      COPY conf/default.conf  /etc/nginx/
      
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
      ```

    b. create a new entrypoint.sh file in the frontend folder

      ```bash
      #!/bin/bash

      set -eu

      echo "update Nginx config"
      envsubst '\${HOST1} \${HOST2} \${PORT}' < /etc/nginx/default.conf > /etc/nginx/nginx.conf

      exec "$@"
      ```

    c. now let's create our NGINX config template, create a new folder named "conf" and a new file in it named "default.conf", create the following content of this file.

      ```config
      # For more information on configuration, see:
      #   * Official English Documentation: http://nginx.org/en/docs/
      #   * Official Russian Documentation: http://nginx.org/ru/docs/
      
      
      worker_processes auto;
      error_log /var/log/nginx/error.log;
      pid /run/nginx.pid;
      
      # Load dynamic modules. See /usr/share/doc/nginx/README.dynamic.

      include /usr/share/nginx/modules/*.conf;
      
      events {
          worker_connections 1024;
      }
      
      http {
          log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                            '$status $body_bytes_sent "$http_referer" '
                            '"$http_user_agent" "$http_x_forwarded_for"';
      
          access_log /dev/stdout; # /var/log/nginx/access.log  
      
          sendfile            on;
          tcp_nopush          on;
          tcp_nodelay         on;
          keepalive_timeout   65;
          types_hash_max_size 4096;
      
          include             /etc/nginx/mime.types;
          default_type        application/octet-stream;
      
          # Load modular configuration files from the /etc/nginx/conf.d directory.
          # See http://nginx.org/en/docs/ngx_core_module.html#include
          # for more information.
          include /opt/app-root/etc/nginx.d/*.conf;
      
          server {
              listen       8080 default_server;
              listen       [::]:8080 default_server;
              server_name  front_end;
              root         /usr/share/nginx/html;
      
              # Load configuration files for the default server block.
              include /opt/app-root/etc/nginx.default.d/*.conf;
              location / {
                 index  index.html;
                 try_files $uri /index.html;
                 expires -1; # Set it to different value depending on your standard requirements
              }
              location /backend1 {
                  proxy_pass http://$HOST1:$PORT/;
              }
              location /backend2 {
                  proxy_pass http://$HOST2:$PORT/;
              }
              location /probes/readiness {
                  return 200 "OK";
              }
              location /probes/liveness {
                  return 200 "OK";
              }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
          root   /usr/share/nginx/html;
        }
       }
      }
      ```

    d. now let's build our frontend continer image

      ```bash
      docker build . -t quay.io/<UserName>/fronend-app:v1
      ```

    e. Lets test our new built image.

      First we need to run our backend application

      ```bash
      docker run -d -p 9091:9091 --name=backend quay.io/<UserName>/backend-app:v1
      ```

      Now we need to check our local ip in the dev station

      ```bash
      ip a
      # output
      1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
          link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
          inet 127.0.0.1/8 scope host lo
             valid_lft forever preferred_lft forever
          inet6 ::1/128 scope host 
             valid_lft forever preferred_lft forever
      2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
          link/ether 00:22:48:87:18:7a brd ff:ff:ff:ff:ff:ff
          inet 172.16.5.4/24 brd 172.16.5.255 scope global eth0
             valid_lft forever preferred_lft forever
          inet6 fe80::222:48ff:fe87:187a/64 scope link 
             valid_lft forever preferred_lft forever
      3: docker0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
          link/ether 02:42:06:71:20:9c brd ff:ff:ff:ff:ff:ff
          inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
             valid_lft forever preferred_lft forever
          inet6 fe80::42:6ff:fe71:209c/64 scope link 
             valid_lft forever preferred_lft forever
      5: vethf817069@if4: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master docker0 state UP group default 
          link/ether c6:ea:9c:d9:79:d1 brd ff:ff:ff:ff:ff:ff link-netnsid 0
          inet6 fe80::c4ea:9cff:fed9:79d1/64 scope link 
             valid_lft forever preferred_lft forever
      ```

      look at 2: and look at inet address, this will be our local ip to provide as environment variables to the front end

      Now run the frontend container

      ```Bash
      docker run -d --name=frontend -e HOST1=<eth0-inet-address> -e HOST2=<eth0-inet-address> -e PORT=9091 -p 8080:8080 quay.io/<UserName>/frontend-app:v1
      ```

      we should get our web page running and able to access to the backend successfully via the links in the page.

      Lets test to see if we can change the message in the frontend

      1. remove and stop the current container.

          ```bash
          docker rm -f frontend
          ```

      2. run the frontend with extra env. to update the message in the page

          ```bash
          docker run -d --name=frontend \
          -e HOST1=<eth0-inet-address> \
          -e HOST2=<eth0-inet-address> \
          -e PORT=9091 \
          -e API_URL="this is my message" \
          -p 8080:8080 \
          quay.io/<UserName>/frontend-app:v1
          ```

      3. if everything workes well we will get the message that we set in the API_URL environment varible.

11. Now Push our frontend container to the quay.io registry

  ```Bash
  docker push quay.io/<UserName>/frontend-app:v1
  ```

## Now we have a working frontend container ##
