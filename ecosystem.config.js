module.exports = {
    apps: [
      {
        name: 'microshop',
        script: 'src/server.js',
        instances: 'max',
        exec_mode: 'cluster',
        env_development: {
          PORT: 3000
        },
        env_production: {
          PORT: 8080
        }
      }
    ]
};  