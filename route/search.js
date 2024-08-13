const express = require('express');
const router = express.Router();
const { searchUsers, searchProducts } = require('../controller/search');

router.get('/user', async (req, res) => {
  try {
    const { query } = req.query;
    const result = await searchUsers(query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/product', async (req, res) => {
  try {
    const { query } = req.query;
    const result = await searchProducts(query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;