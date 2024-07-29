const redis = require('./redis');

const setCache = async (key, value, expiry = 3600) => {
    try {
        console.log(`setting cache for key ${key} with expiry of ${expiry} seconds`);
        await redis.set(key, JSON.stringify(value), 'EX', expiry);
    } catch (error) {
        console.error(`error setting cache for key: ${key}`, error);
    }
};

const getCache = async (key) => {
    try {
        console.log(`getting cache for key ${key}`);
        const data = await redis.get(key);
        if (data) {
            console.log(`cache hit for key ${key}`);
            return JSON.parse(data);
        } else {
            console.log(`cache miss for key ${key}`);
            return null;
        }
    } catch (error) {
        console.error(`error getting cache for key ${key}:`, error);
        return null;
    }
};

const deleteCache = async (key) => {
    try {
        console.log(`deleting cache for key ${key}`);
        await redis.del(key);
    } catch (error) {
        console.error(`error deleting cache for key ${key}:`, error);
    }
};

module.exports = {
  setCache,
  getCache,
  deleteCache
};