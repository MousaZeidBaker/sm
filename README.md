# SecretsManager (SM)

SM is an open-source self-hosted secrets manager with zero cost. The idea with SM is that it must be completely free of any cost, thus all resources as well as hosting is picked with that in mind.

## Hosting your own SM

### Prerequisites

* [AWS account](https://aws.amazon.com/) to host the infrastructure

* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) and [jq](https://stedolan.github.io/jq/) to deploy the infrastructure

* [Vercel account](https://vercel.com/) to host the webb app

### Deploy infrastructure

The `infrastructure.sh` script deploys the necessary AWS resources. The following resources will be deployed:

* `Cognito user-pool`
* `Cognito identity-pool`
* `IAM role`
* `IAM policy`

A database is not needed as secrets will be stored encrypted in `AWS Systems Manager Parameter Store`. Secrets are AES encrypted by the web app before stored in `Parameter Store` so that only the web app that holds the encryption passphrase will be able to decrypt secrets. All resources are within the [AWS free tier](https://aws.amazon.com/free).

In order to avoid latency, it's recommended to deploy the resources to `us-east-1` since it's the [default deployment region](https://vercel.com/support/articles/choosing-deployment-regions) for Vercel and cannot be changed for hobby accounts. To deploy the resources, create an `IAM user` with programmatic access and with administrator access, then run the following command. Delete the user onces the resources has been deployed. Take note of the output as it will be used as environment variables in the webb app.

```shell
AWS_DEFAULT_REGION=us-east-1 AWS_ACCESS_KEY_ID=my-access-key AWS_SECRET_ACCESS_KEY=my-secret-access-key ./infrastructure/infrastructure.sh
```

### Run web app locally before deploying (optional)

Run the web app locally to try it out and to make sure everything is set up correctly.

Copy env.local.example to .env.local and configure environment variables in that file
```shell
cp env.local.example .env.local
```

Install dependencies

```shell
yarn install
```

Run the web app locally
```shell
yarn run dev
```

Open a browser and head over to `localhost`

### Deploy web app

Install dependencies

```shell
yarn install
```

Login to your Vercel account
```shell
yarn run vercel login
``` 

Link your local directory to a [Vercel Project](https://vercel.com/docs/platform/projects). You can link to an existing project, or preferably create a new one.

```shell
yarn run vercel link
```

a project should now be seen in the Vercel dashboard. Before deploying, configure [environment variables ](https://vercel.com/docs/environment-variables) directly from the Project Settings. The necessary environment variables are found in `.env.local.example` file.

Deploy

```shell
yarn run vercel deploy --prod
```
