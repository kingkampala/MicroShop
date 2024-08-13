const User = require('../model/user');
const Product = require('../model/product');
const { getCache, setCache } = require('../cache/service');

const searchUsers = async (query) => {
  try {
    const cacheKey = `search:users:${query}`;
    const cachedUsers = await getCache(cacheKey);
    
    if (cachedUsers) {
      return { users: cachedUsers };
    }
    
    const searchRegex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [
        { username: searchRegex },
        { email: searchRegex },
        { name: searchRegex }
      ]
    });
    
    if (users.length > 0) {
      await setCache(cacheKey, users);
      return { data: users };
    } else {
      return { message: 'no result', users: [] };
    }
  } catch (error) {
    throw new Error('error searching for users: ' + error.message);
  }
};

const searchProducts = async (query) => {
  try {
    const cacheKey = `search:products:${query}`;
    const cachedProducts = await getCache(cacheKey);
    
    if (cachedProducts) {
      return { products: cachedProducts };
    }
    
    const searchRegex = new RegExp(query, 'i');
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    });
    
    if (products.length > 0) {
      await setCache(cacheKey, products);
      return { data: products };
    } else {
      return { message: 'no result', products: [] };
    }
  } catch (error) {
    throw new Error('error searching for products: ' + error.message);
  }
};

module.exports = {
  searchUsers,
  searchProducts,
};