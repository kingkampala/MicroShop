const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {get, getId, upload, update, remove} = require('../controller/product');
const { getCache, setCache, deleteCache } = require('../cache/service');

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management
 */

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Upload a new product
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product successfully uploaded
 */
router.post('/', authenticateToken, upload);

/**
 * @swagger
 * /product:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', async (req, res, next) => {
    try {
        const cachedProducts = await getCache('products');
        if (cachedProducts) {
          return res.json(cachedProducts);
        }
        const products = await get(req, res, next);
        await setCache('products', products);
        res.json(products);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Product]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const cachedProduct = await getCache(`product:${id}`);
        if (cachedProduct) {
        return res.json(cachedProduct);
        }
        const product = await getId(req, res, next);
        await setCache(`product:${id}`, product);
        res.json(product)
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /product/{id}:
 *   put:
 *     summary: Update product details by ID
 *     tags: [Product]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product details successfully updated
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticateToken, update);

/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     summary: Delete product by ID
 *     tags: [Product]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product successfully deleted
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        await deleteCache(`product:${id}`);
        await deleteCache('products');
        await remove(req, res, next);
    } catch (error) {
        next(error);
    }
});

module.exports = router;