module.exports = {
  apps: [
    {
      name: "snowstep-backend",
      script: "server.js",
      cwd: "/var/www/snowstep/backend",
      node_args: "--env-file=/var/www/snowstep/backend/.env",
      env: {
        NODE_ENV: "production",
        PORT: "5000",
      },
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
    },
  ],
};
