# AWS EC2 deployment

The deployment uses CloudFormation, a generated SSH key retrieved from SSM Parameter Store, private S3 release storage, Nginx, PM2, and CloudFront. GitHub Actions temporarily allows SSH only from its current runner IP and removes that ingress rule after deployment. It provisions a new EC2 stack; it does not deploy to the separately created manual EC2 instance.

See [`hosting.md`](./hosting.md) for the architecture, required GitHub Actions variables and secrets, setup instructions, deployment lifecycle, verification, troubleshooting, and cleanup.
