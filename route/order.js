const express = require('express');
const router = express.Router();
const { makeOrder, getId, get, updateOrder, updateStats, cancel, remove } = require('../controller/order');
const authenticateToken = require('../middleware/auth');
const { getCache, setCache, deleteCache } = require('../cache/service');

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management
 */

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Create a new order
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order successfully created
 */
router.post('/', authenticateToken, makeOrder);

/**
 * @swagger
 * /order:
 *   get:
 *     summary: Get all orders
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const cachedOrders = await getCache('orders');
    if (cachedOrders) {
      return res.json(cachedOrders);
    }
    const orders = await get(req, res, next);
    await setCache('orders', orders);
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /order/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Order]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  const { id } = req.params;
  try {
    const cachedOrder = await getCache(`order:${id}`);
    if (cachedOrder) {
      return res.json(cachedOrder);
    }
    const order = await getId(req, res, next);
    await setCache(`order:${id}`, order);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /order/{id}:
 *   put:
 *     summary: Update order details by ID
 *     tags: [Order]
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
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order details successfully updated
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/', authenticateToken, updateOrder);

/**
 * @swagger
 * /order/{id}/stats:
 *   put:
 *     summary: Update order statistics by ID
 *     tags: [Order]
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
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status of the order
 *               shippedDate:
 *                 type: string
 *                 format: date-time
 *                 description: The date when the order was shipped
 *     responses:
 *       200:
 *         description: Order statistics successfully updated
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/stats', authenticateToken, updateStats);

/**
 * @swagger
 * /order/{id}:
 *   patch:
 *     summary: Cancel an order by ID
 *     tags: [Order]
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
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Order successfully canceled
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id', authenticateToken, cancel);

/**
 * @swagger
 * /order/{id}:
 *   delete:
 *     summary: Delete order by ID
 *     tags: [Order]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order successfully deleted
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        await deleteCache(`order:${id}`);
        await deleteCache('orders');
        await remove(req, res, next);
    } catch (error) {
        next(error);
    }
});

module.exports = router;