const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {register, login, update, remove, get, getId} = require('../controller/user');

router.post('/register', register);

router.post('/login', login);

router.get('/', authenticateToken, get);

router.get('/:id', authenticateToken, getId);

router.put('/:id', authenticateToken, update);

router.delete('/:id', authenticateToken, remove);

module.exports = router;