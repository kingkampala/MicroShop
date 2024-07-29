const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {register, login, update, remove, get, getId} = require('../controller/user');
const { getCache, setCache, deleteCache } = require('../cache/service');

router.post('/register', register);

router.post('/login', login);

router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const cachedUsers = await getCache('users');
        if (cachedUsers) {
          return res.json(cachedUsers);
        }
        const users = await get(req, res, next);
        await setCache('users', users);
        res.json(users);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', authenticateToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const cachedUser = await getCache(`user:${id}`);
        if (cachedUser) {
        return res.json(cachedUser);
        }
        const user = await getId(req, res, next);
        await setCache(`user:${id}`, user);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', authenticateToken, update);

router.delete('/:id', authenticateToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        await deleteCache(`user:${id}`);
        await remove(req, res, next);
    } catch (error) {
        next(error);
    }
});

module.exports = router;