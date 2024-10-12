const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'MicroShop API',
            version: '1.0.0',
            description: 'MicroShop API Documentation',
        },
        servers: [{ url: 'https://microshop.onrender.com' }]
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerDocs };