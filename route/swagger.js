const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const { swaggerDocs } = require('../controller/swagger');

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = router;