module.exports = {
  apps: [
    {
      name: "snowstep-api",
      script: "server.js",
      cwd: "/var/www/snowstep/current/backend",
      node_args: "--env-file=/var/www/snowstep/current/backend/.env",
      env: {
        NODE_ENV: "production",
        PORT: "5000",
      },
      autorestart: true,
      max_restarts: 5,
    },
  ],
};
