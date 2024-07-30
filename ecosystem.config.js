module.exports = {
    apps: [
      {
        name: 'microshop',
        script: 'src/server.js',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
          NODE_ENV: 'development'
        },
        env_production: {
          NODE_ENV: 'production'
        }
      }
    ]
};  