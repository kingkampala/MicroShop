const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'MicroShop API',
            version: '1.0.0',
            description: 'MicroShop API Documentation',
        },
        servers: [{ url: 'https://microshop.onrender.com', url: 'http://localhost:2810' }],
        components: {
            schemas: {
              User: {
                type: 'object',
                properties: {
                  _id: { type: 'string', description: 'User ID' },
                  name: { type: 'string', description: 'User name' },
                  username: { type: 'string', required: true, description: 'Unique username' },
                  email: { type: 'string', required: true, description: 'User email' },
                  password: { type: 'string', required: true, description: 'Password' },
                  createdAt: { type: 'string', format: 'date-time', description: 'Creation date' }
                }
              },
              Product: {
                type: 'object',
                properties: {
                  _id: { type: 'string', description: 'Product ID' },
                  name: { type: 'string', required: true, description: 'Product name' },
                  price: { type: 'number', required: true, description: 'Product price' },
                  description: { type: 'string', description: 'Product description' },
                  createdAt: { type: 'string', format: 'date-time', description: 'Creation date' }
                }
              },
              Order: {
                type: 'object',
                properties: {
                  _id: { type: 'string', description: 'Order ID' },
                  userId: { type: 'string', ref: 'User', required: true, description: 'User ID' },
                  productId: { type: 'string', ref: 'Product', required: true, description: 'Product ID' },
                  quantity: { type: 'number', required: true, description: 'Quantity ordered' },
                  status: { type: 'string', enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending', description: 'Order status' },
                  createdAt: { type: 'string', format: 'date-time', description: 'Order creation date' }
                }
              }
            },
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: ['./route/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerDocs };