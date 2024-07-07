const router = express.Router();
const express = require('express');
const authenticateToken = require('../middleware/auth');

// Protected route example
router.get('/profile', authenticateToken, (req, res) => {
    res.json(req.user);
});

module.exports = router;