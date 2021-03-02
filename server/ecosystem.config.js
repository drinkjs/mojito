module.exports = {
  apps: [
    {
      name: "mojito-server",
      script: "./dist/main.js",
      watch: false,
      env_prod: {
        NODE_ENV: "production",
      }
    },
  ],
};
