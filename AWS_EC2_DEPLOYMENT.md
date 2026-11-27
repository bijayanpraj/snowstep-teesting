# AWS deployment

The GitHub Actions workflow in `.github/workflows/ci.yml` only builds the frontend and checks backend JavaScript syntax. It runs on pushes and pull requests targeting `main` or `master`, and can also be started manually.

AWS deployment is not configured in GitHub Actions. The files under `infra/` and `infra/deploy-instance.sh` are not run by the CI workflow. Deploying to AWS requires a separate deployment process.
