const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {get, getId, upload, update, remove} = require('../controller/product');

router.post('/', authenticateToken, upload);

router.get('/', get);

router.get('/:id', getId);

router.put('/:id', authenticateToken, update);

router.delete('/:id', authenticateToken, remove);

module.exports = router;