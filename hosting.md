# Snowstep Hosting and Deployment

This guide documents the CloudFormation-based hosting and GitHub Actions deployment configured for Snowstep.

## Architecture

```text
GitHub push or manual workflow run
  -> GitHub Actions builds the Vite frontend and checks backend dependencies
  -> Actions creates a release archive
  -> CloudFormation creates or updates the Snowstep EC2 stack
  -> CloudFormation stores the generated EC2 private key in SSM; Actions stores application secrets there
  -> Actions temporarily opens SSH only to the current runner's public IP
  -> Actions transfers the archive and runs the EC2 deploy script over SSH
  -> EC2 installs backend production dependencies, updates Nginx/PM2, checks health
  -> CloudFront serves the frontend and proxies API requests through Nginx
```

The workflow provisions a **new** EC2 instance, Elastic IP, private release bucket, instance role, generated EC2 key pair, and CloudFront distribution using [`infra/ec2-instance.yaml`](./infra/ec2-instance.yaml). Your separately created EC2 instance is not managed or replaced by this stack; it remains a separate resource and may continue to incur charges.

The CloudFormation-created private SSH key is stored by EC2 in SSM Parameter Store. GitHub Actions retrieves it with AWS credentials. The workflow also obtains the instance's SSH host key through SSM, temporarily allows port 22 only from the current runner's `/32`, and removes that rule when deployment finishes. Port 22 is not permanently open to the internet.

## Project layout and runtime

- Frontend: `frontend/`; build command: `npm run build`.
- Backend: `backend/`; package manifest: `backend/package.json`; production entry point: [`backend/server.js`](./backend/server.js).
- Backend routes and `/api/health`: [`backend/index.js`](./backend/index.js).
- PM2 process config: [`backend/ecosystem.config.cjs`](./backend/ecosystem.config.cjs).
- Nginx site config: [`infra/nginx-snowstep.conf`](./infra/nginx-snowstep.conf).
- EC2 deployment script: [`infra/deploy-instance.sh`](./infra/deploy-instance.sh).
- Production backend port: `5000`, bound to `127.0.0.1`. Do not expose port 5000 in the security group.
- Production frontend uses relative `/api` requests, so it works behind Nginx and CloudFront.

The frontend currently has no `package-lock.json`; CI therefore uses `npm install`. Adding and committing `frontend/package-lock.json` would make frontend dependency installation reproducible and allow CI to use `npm ci`.

## GitHub Actions variables and secrets

In the repository, open **Settings → Secrets and variables → Actions**.

Add these **repository variables**:

| Name | Value |
| --- | --- |
| `AWS_REGION` | AWS region for the stack, for example `us-east-1` |
| `CFN_STACK_NAME` | Stack name starting with a letter; use the same name on future runs |

Add these **repository secrets**:

| Name | Value |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | AWS access key ID |
| `AWS_SECRET_ACCESS_KEY` | Matching AWS secret access key |
| `AWS_SESSION_TOKEN` | Required for temporary credentials such as AWS Learner Lab credentials |
| `MONGODB_URI` | MongoDB Atlas connection URI for the `snowstep` database |
| `AUTH_TOKEN_SECRET` | Random secret of at least 32 characters |

Use the exact secret name `AWS_ACCESS_KEY_ID`; `AWS_SECRET_KEY_ID` is not used. AWS credentials belong in **Secrets**, not **Variables**. If real credentials were stored as repository variables or exposed elsewhere, remove them and rotate them. Temporary AWS session credentials expire; update all three AWS secrets with a fresh credential set before deploying again.

The AWS identity needs permissions to discover the default VPC/subnet, deploy CloudFormation with IAM, manage the stack's EC2 security group, upload to S3, read the generated key from SSM, write the app parameters, and run SSM commands. Do not use root credentials.

Generate the auth secret with:

```bash
openssl rand -hex 32
```

Never put production values in the repository. [`backend/.env.example`](./backend/.env.example) contains placeholders only. The workflow stores `MONGODB_URI` and `AUTH_TOKEN_SECRET` as SSM `SecureString` parameters. The EC2 deploy script creates the release's `backend/.env` from those parameters.

## Requirements before first deployment

1. The selected AWS region must have a default VPC and at least one default subnet; the workflow discovers them.
2. The AWS credentials must be active and have the permissions listed above.
3. Configure MongoDB Atlas with a database user and connection URI. URL-encode special characters in the password.
4. The CloudFormation stack creates an Elastic IP. Add the EC2 IP printed near the start of the deployment step as an `/32` entry in Atlas Network Access. If health checks fail because Atlas has not allowed the address yet, update the allowlist and rerun.
5. Review AWS pricing before deploying. The stack creates billable resources, including EC2, an Elastic IP, S3, and CloudFront. The previously created manual EC2 remains separate.

## GitHub Actions behavior

The workflow is [`.github/workflows/ci.yml`](./.github/workflows/ci.yml):

- Pushes and pull requests targeting `main` or `master` run the frontend build and backend install/syntax checks.
- Pull requests do not deploy.
- A push to `main` or `master`, or a manual run from either branch, deploys after the checks pass.
- The archive contains backend runtime files, `frontend/dist`, the Nginx config, and deployment script. It excludes backend `node_modules`, `.env*`, and Vercel-only files.
- The deploy steps discover the network, create or update the stack, store secrets in SSM, upload the release to S3, retrieve the EC2 key, briefly authorize SSH from the runner, deploy, and remove temporary access.

Commit and push the workflow and infrastructure files to GitHub before expecting Actions to use them. A local workflow edit alone does not affect GitHub.

## First deployment, step by step

1. Add the repository variables and secrets listed above. Confirm the AWS session token is current.
2. Push the workflow and infrastructure files to `main`, or run **Actions → Build and deploy Snowstep → Run workflow** on `main`.
3. On the first run, CloudFormation creates the stack and CloudFront distribution. This can take several minutes.
4. Copy the `PublicIp` printed near the start of deployment into MongoDB Atlas Network Access as an `/32` rule.
5. Rerun the workflow if health checks failed before the Atlas allowlist was updated.
6. Open the `PublicUrl` printed by Actions. It is the CloudFront HTTPS URL; initial CloudFront propagation can take additional time.

This setup does not require `EC2_HOST`, `EC2_USER`, `EC2_SSH_PRIVATE_KEY`, or `EC2_KNOWN_HOSTS` GitHub settings. AWS credentials are used to obtain the generated EC2 key and deployment resources.

## What the deployment does

The template's user data installs Node.js 22, Nginx, PM2, AWS CLI, OpenSSH, and the SSM Agent, then prepares `/var/www/snowstep/releases`. The EC2 instance role grants access to the release bucket and stack-specific SSM parameters.

For each deployment, Actions:

1. Builds the frontend and checks backend dependencies and JavaScript syntax.
2. Archives backend runtime files, `frontend/dist`, the Nginx config, and the deployment script.
3. Creates or updates the CloudFormation stack and stores the app secrets as SSM `SecureString` parameters.
4. Uploads the release to the stack's private S3 bucket and waits for EC2 to register with SSM.
5. Retrieves the EC2 SSH key from SSM, opens SSH only to the runner's current `/32`, and transfers the archive.
6. Runs [`infra/deploy-instance.sh`](./infra/deploy-instance.sh) on EC2. It creates a versioned release, installs production backend dependencies, creates `.env`, switches `current`, reloads Nginx and PM2, and checks the API through Nginx.
7. Checks `/api/health` through the public CloudFront URL, removes the temporary SSH ingress rule, and reports deployment success.

If a workflow is forcibly terminated before cleanup, inspect the EC2 security group and remove any temporary port 22 rule for the runner's `/32`.

## Verification and troubleshooting

On the CloudFormation-managed EC2 instance:

```bash
pm2 status
pm2 logs snowstep-api --lines 50
curl http://127.0.0.1:5000/api/health
curl http://127.0.0.1/api/health
sudo nginx -t
```

The health endpoint should return `"database":"connected"`. The deploy script checks it through local Nginx; Actions also checks the public CloudFront URL.

- **Only build steps run:** confirm the workflow changes were pushed and that the run is on `main` or `master`. Pull requests intentionally do not deploy.
- **AWS authentication fails:** confirm the access key, matching secret key, and current session token are in repository **Secrets** with exact names.
- **No default VPC or subnet:** select a region with a default VPC and subnet, or update the workflow/template to accept explicit network values.
- **CloudFormation fails:** inspect the failing stack event. Check IAM permissions, resource quotas, and the selected region.
- **SSM does not show the instance online:** inspect EC2 user-data logs, the instance profile, and outbound network access. The template attaches `AmazonSSMManagedInstanceCore`.
- **SSH connection fails:** verify the runner IP was authorized, the generated key parameter is readable, and the EC2 security group has no stale temporary rule.
- **Database health check fails:** verify the MongoDB URI, password URL encoding, and Atlas IP allowlist for the stack's Elastic IP.
- **AWS Learner Lab credentials expired:** replace all temporary AWS credential secrets, then rerun the workflow.

To stop AWS charges after testing, delete the CloudFormation stack after confirming you no longer need it. This does not delete your separate manually created EC2 instance or your MongoDB Atlas data.
