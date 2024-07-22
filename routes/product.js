const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {get, getId, post} = require('../controller/product');

router.post('/upload', post);

router.get('/', get);

router.get('/profile', authenticateToken, (req, res) => {
    res.json(req.user);
});

module.exports = router;