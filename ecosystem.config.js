module.exports = {
    apps: [
      {
        name: 'microshop',
        script: './src/server.js',
        instances: 'max',
        exec_mode: 'cluster',
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        increment_var: 'PORT',
        env_development: {
          NODE_ENV: 'development',
          PORT: 3000
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: process.env.PORT || 2810
        },
      }
    ]
};