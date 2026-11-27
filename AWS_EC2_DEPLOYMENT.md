# AWS EC2 deployment

The active GitHub Actions workflow deploys Snowstep to an existing EC2 instance over SSH. It builds and validates the app, verifies the configured SSH host key, runs [`infra/deploy.sh`](./infra/deploy.sh) remotely, and checks `/api/health`. It does not use AWS credentials, CloudFormation, IAM role creation, or SSM.

Configure `EC2_HOST` and `EC2_USER` as repository variables, and `EC2_SSH_PRIVATE_KEY`, `EC2_KNOWN_HOSTS`, `MONGODB_URI`, and `AUTH_TOKEN_SECRET` as repository secrets. The existing instance's security group must already permit SSH from the GitHub Actions runner and HTTP from intended visitors; the workflow does not edit AWS networking.

The optional [`infra/ec2-instance.yaml`](./infra/ec2-instance.yaml) can create a new EC2 host without an IAM role, but still requires EC2/VPC permissions and is not called by the active workflow. See [`hosting.md`](./hosting.md) for setup, SSH host-key verification, deployment behavior, the AWS Academy IAM limitation, and troubleshooting.
