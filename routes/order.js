const express = require('express');
const router = express.Router();
const { makeOrder, getId, get, updateOrder, updateStats, cancel, remove } = require('../controller/order');
const authenticateToken = require('../middleware/auth');
const { getCache, setCache, deleteCache } = require('../cache/service');

router.post('/', authenticateToken, makeOrder);

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

router.put('/:id/', authenticateToken, updateOrder);

router.put('/:id/', authenticateToken, updateStats);

router.patch('/:id', authenticateToken, cancel);

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