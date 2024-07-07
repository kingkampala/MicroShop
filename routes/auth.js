const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {register, login, get} = require('../controller/auth');

router.post('/register', register);

router.post('/login', login);

router.get('/', get);

// Protected route example
router.get('/profile', authenticateToken, (req, res) => {
    res.json(req.user);
});

module.exports = router;