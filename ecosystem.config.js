module.exports = {
    apps: [
      {
        name: 'microshop',
        script: './src/server.js',
        instances: 1,//'max',
        exec_mode: 'fork',//'cluster',
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env_development: {
          NODE_ENV: 'development',
          PORT: 2810
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: process.env.PORT || 2810
        }
      }
    ]
};