const redis = require('./redis');

const setCache = async (key, value, expiry = 3600) => {
    console.log(`setting cache for key: ${key}`);
    await redis.set(key, JSON.stringify(value), 'EX', expiry);
};

const getCache = async (key) => {
    console.log(`getting cache for key: ${key}`);
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
};

const deleteCache = async (key) => {
    console.log(`deleting cache for key: ${key}`);
    await redis.del(key);
};

module.exports = {
  setCache,
  getCache,
  deleteCache
};