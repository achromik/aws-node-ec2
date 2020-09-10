# EC2 app with Node.js

#### Development
Build docker image and then run to verify it's working correctly:
```
$ docker build . -t ec2-app
$ docker run -p 3000:3000 ec2-app
```

#### Pushing Docker image to Docker Hub
```
$ docker login # Use your Docker Hub credentials here
$ docker tag ec2-app <YOUR_DOCKER_USERNAME>/ec2-app
$ docker push <YOUR_DOCKER_USERNAME>/ec2-app
```

#### Deploy

```
ssh -i <NAME_OF_KEYPAIR_FILE> ec2-user@<PUBLIC_DNS>
docker run -d -p 3000:3000 <YOUR_DOCKER_USERNAME>/ec2-app
```

[Inspiration](https://stackabuse.com/deploying-node-js-apps-to-aws-ec2-with-docker/)
