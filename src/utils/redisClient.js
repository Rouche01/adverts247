const redis = require("redis");
require("dotenv").config();

const redisClient = redis.createClient({ url: process.env.REDIS_URL });

const getOrSetFallback = async (key, field, fallbackValue) => {
  try {
    const value = await redisClient.hGet(key, field);
    if (!value && fallbackValue) {
      await redisClient.hSet(key, field, fallbackValue);
      return fallbackValue;
    }
    return value;
  } catch (err) {
    console.log(err);
  }
};

const updateKeyValue = async (key, field, value) => {
  try {
    await redisClient.hSet(key, field, value);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { redisClient, getOrSetFallback, updateKeyValue };
