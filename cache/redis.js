const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: times => Math.min(times * 50, 2000),
    connectTimeout: 10000
});

redis.on('connect', () => {
    console.log('redis connection successful');
});

redis.on('error', (err) => {
    console.error('redis error', err);
});

module.exports = redis;