const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {get, getId, upload, update, remove} = require('../controller/product');
const { getCache, setCache, deleteCache } = require('../cache/service');

router.post('/', authenticateToken, upload);

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

router.put('/:id', authenticateToken, update);

router.delete('/:id', authenticateToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        await deleteCache(`product:${id}`);
        await remove(req, res, next);
    } catch (error) {
        next(error);
    }
});

module.exports = router;