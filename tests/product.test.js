const request = require('supertest');
const { app, connectDb } = require('../src/app');
const mongoose = require('mongoose');
const Product = require('../model/product');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET } = process.env;

describe('Product Service', () => {
  let server;
  let token;

  beforeAll(async () => {
    await connectDb();

    server = app.listen(0, () => {
      console.log('test server is running...');
    });
    token = jwt.sign({ username: 'testuser' }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (server) {
      server.close();
    }
    //server.close();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  test('should upload a new product', async () => {
    const res = await request(server)
      .post('/product')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'testproduct', price: 100 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'testproduct');
  });

  test('should get all products', async () => {
    const res = await request(server).get('/product');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should get a product by ID', async () => {
    const product = new Product({ name: 'testproduct', price: 100 });
    await product.save();

    const res = await request(server).get(`/product/${product._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'testproduct');
  });

  test('should update a product', async () => {
    const product = new Product({ name: 'testproduct', price: 100 });
    await product.save();

    const res = await request(server)
      .put(`/product/${product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'updatedproduct', newPrice: 200 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('product updated successfully');
  });

  test('should delete a product', async () => {
    const product = new Product({ name: 'testproduct', price: 100 });
    await product.save();

    const res = await request(server)
      .delete(`/product/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});