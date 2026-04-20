module.exports = {
  apps: [{
    name: "user-auth-system",
    script: "server.js",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    },
    watch: true,
    ignore_watch: ["node_modules", "logs"],
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "1G"
  }]
};