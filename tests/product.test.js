const request = require('supertest');
const { app, connectDb } = require('../src/app');
const mongoose = require('mongoose');
const Product = require('../model/product');
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');
require('dotenv').config();

const { JWT_SECRET } = process.env;
const { MONGO_URI } = process.env;

jest.mock('ioredis', () => require('ioredis-mock'));

describe('Product Service', () => {
  let server;
  let token;
  let redisClient;
  let uniqueProductName;

  beforeAll(async () => {
    if (!MONGO_URI) {
      throw new Error('MONGO_URL environment variable is not set');
    }
    await connectDb(MONGO_URI);

    server = app.listen(0, () => {
      console.log('test server is running...');
    });

    redisClient = new Redis();

    token = jwt.sign({ username: 'testuser' }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (server) {
      server.close();
    }
    await redisClient.quit();
  });

  beforeEach(async () => {
    uniqueProductName = `testproduct_${Date.now()}`;
    await Product.deleteMany({ name: new RegExp(`^${uniqueProductName}`) });
    await redisClient.flushall();
  });

  afterEach(async () => {
    await redisClient.flushall();
  });

  test('should upload a new product', async () => {
    const res = await request(server)
      .post('/product')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: uniqueProductName, price: 100 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', uniqueProductName);
  });

  test('should get all products', async () => {
    const res = await request(server).get('/product');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should get a product by ID', async () => {
    const product = new Product({ name: uniqueProductName, price: 100 });
    await product.save();

    const res = await request(server).get(`/product/${product._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', uniqueProductName);
  });

  test('should update a product', async () => {
    const product = new Product({ name: uniqueProductName, price: 100 });
    await product.save();

    const res = await request(server)
      .put(`/product/${product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `updated_${uniqueProductName}`, newPrice: 200 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('product updated successfully');
  });

  test('should delete a product', async () => {
    const product = new Product({ name: uniqueProductName, price: 100 });
    await product.save();

    const res = await request(server)
      .delete(`/product/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});