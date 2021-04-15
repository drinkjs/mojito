module.exports = {
  apps: [
    {
      name: "mojito-server",
      script: "./dist/main.js",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
