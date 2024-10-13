const express = require('express');
const router = express.Router();
const { searchUsers, searchProducts } = require('../controller/search');

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Search management
 */

/**
 * @swagger
 * /search/users:
 *   get:
 *     summary: Search users
 *     tags: [Search]
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/user', async (req, res) => {
  try {
    const { query } = req.query;
    const result = await searchUsers(query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /search/products:
 *   get:
 *     summary: Search products
 *     tags: [Search]
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
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