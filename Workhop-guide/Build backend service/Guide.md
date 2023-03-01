# Part 1 of NGINX Gateway #

## Build a Node Backend service with a simple GET api ##

1. Create a folder named "backend" and enter it.

    ```bash
    mkdir backend
    cd backend
    ```

2. create a src folder and enter it.

    ```bash
    mkdir src
    cd src
    ```

3. init a new node application

    ```bash
    npm init

    ...
    This utility will walk you through creating a package.json file.
    It only covers the most common items, and tries to guess sensible defaults.
    
    See `npm help init` for definitive documentation on these fields
    and exactly what they do.
    
    Use `npm install <pkg>` afterwards to install a package and
    save it as a dependency in the package.json file.
    
    Press ^C at any time to quit.
    package name: (src) backend
    version: (1.0.0) 
    description: backend application
    entry point: (index.js) app.js
    test command: 
    git repository: 
    keywords: 
    author: 
    license: (ISC) 
    About to write to /workspaces/NGNIX-API-Gateway-Workshop/backend/src/package.json:
    
    {
      "name": "backend",
      "version": "1.0.0",
      "description": "backend application",
      "main": "app.js",
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "author": "",
      "license": "ISC"
    }
    
    
    Is this OK? (yes)
    ```

4. Create the Following "app.js" file in the src folder

    ```JS
    const express = require('express');
    const app = express();
    const router = express.Router();
    var port = process.env.PORT || 9091;
    var host = process.env.HOSTNAME
    
    router.get('/', function (req, res) {
      res.send(`Hello Red-Hat!, From host --> ${host}`);
      console.log('Someone accessed me!')
    });
    
    // Health Probe - Application Liveliness
    router.get('/health/liveliness',function(req,res){
      console.log(`I am Alive`)
      res.status(200)
      res.send('Healty')
    });
    
    // Health Probe - Application Readiness
    router.get('/health/readiness',function(req,res){
      console.log(`I am Ready`)
      res.status(200);
      res.send('Ready');
      });  
    
    
    //add the router
    app.use('/', router);
    app.listen(port);
    
    console.log(`Running at Port: ${port} From Host: ${host}`);
    ```

5. add the following npm dependencies

    ```bash
    npm install express router
    ```

6. test the node application to see that it is running locally.

    ```bash
    $ node app.js
    ...
    Running at Port: 9091 From Host: codespaces-6b06da
    Someone accessed me!
    ```
  
    if we see in the log the "Someone accessed me!" message everything is working.

7. Build a contianer image for the backend application.

   a. Create a "Dockerfile" in the backend folder with the following content

      ```dockerfile
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
      ```

   b. Now We build our Backend image with docker

      ```bash
      docker build . -t quay.io/<User-Name>/backend-app:v1
      ```

   c. check that the image is running correctly

      ```bash
      docker run -d -p 9091:9091 quay.io/<User-Name>/backend-app:v1
      ```

      ...
      to see if the container is running
      ...

      ```bash
      docker ps -a
      ```

   d. now push the backend image to the quay registry, before doing it, remmber to login in with your user and password

      navigate to www.quay.io, and login with your username and password

      - Click on "+ Create New Repository".
      - enter the image name you enter in the docker build step.
      - Select public
      - Select (Empty repository)
      - Click "Create Public Repositoy"

      ```bash
      docker login -u <User-Name> -p <User-Pass> quay.io
      ```

      Now push the new image to the quay registry.

      ```bash
      docker push uay.io/<User-Name>/backend-app:v1
      ```

### now our backend application is deployed to an image registry and we can access it from anywhere ###
