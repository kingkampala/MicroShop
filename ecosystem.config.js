module.exports = {
    apps: [
      {
        name: 'microshop',
        script: 'src/server.js',
        instances: 'max',
        exec_mode: 'cluster',
        env_development: {
          NODE_ENV: 'development',
          PORT: 3000
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: 8080
        }
      }
    ]
};  