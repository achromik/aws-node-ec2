# EC2 app with Node.js

#### Development

Use Makefile commands to start, test, and build images

#### Backend

To run locally:

```
cd backend
npm run dev
```

#### Deploying to AWS

```
ssh -i <NAME_OF_KEYPAIR_FILE> ec2-user@<PUBLIC_DNS>
docker run --env-file .env -d -p 3000:3000 <YOUR_DOCKER_USERNAME>/ec2-app
```

#### Envs

All secrets are encrypted using [lockgit](https://github.com/jswidler/lockgit)

[Inspiration](https://stackabuse.com/deploying-node-js-apps-to-aws-ec2-with-docker/)
