const request = require('supertest');
const { app, connectDb } = require('../src/app');
const mongoose = require('mongoose');
const Order = require('../model/order');
const Product = require('../model/product');
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const { JWT_SECRET, MONGO_URI } = process.env;

jest.mock('ioredis', () => require('ioredis-mock'));

describe('Order Service', () => {
  let server;
  let token;
  let redisClient;
  let uniqueOrderId;
  //let uniqueUsername;
  let user;
  let product;

  beforeAll(async () => {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    await connectDb(MONGO_URI);

    server = app.listen(0, () => {
      console.log('test server is running...');
    });

    redisClient = new Redis();

    user = await User.create({ _id: uuidv4(), username: `test_user_${Date.now()}`, email: 'test@example.com', password: 'password' });
    product = await Product.create({ _id: uuidv4(), name: 'test product', price: 10 });
    
    token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (server) {
      server.close();
    }
    await redisClient.quit();
  });

  beforeEach(async () => {
    uniqueOrderId = `testorder_${Date.now()}`;
    await User.deleteMany({ username: new RegExp(`^${`test_user_${Date.now()}`}`) });
    await Product.deleteMany({ name: new RegExp(`^${`testproduct_${Date.now()}`}`) });
    await Order.deleteMany({ userId: user._id });
    await redisClient.flushall();
  });

  afterEach(async () => {
    await redisClient.flushall();
  });

  test('should create a new order', async () => {
    const res = await request(server)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 1 });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('order created successfully');
    expect(res.body.order).toHaveProperty('productId', product._id.toString());
  });

  test('should get an order by ID', async () => {
    const order = new Order({ _id: uuidv4(), userId: user._id, productId: product._id, quantity: 1 });
    await order.save();

    const res = await request(server)
      .get(`/order/${order._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('productId', product._id.toString());
  });

  test('should get all orders for user', async () => {
    await Order.create({ _id: uuidv4(), userId: user._id, productId: product._id, quantity: 1 });
    
    const res = await request(server)
      .get('/order')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('should update an order', async () => {
    const order = new Order({ _id: uuidv4(), userId: user._id, productId: product._id, quantity: 1 });
    await order.save();

    const res = await request(server)
      .put(`/order/${order._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('order updated');
    expect(res.body.order).toHaveProperty('quantity', 2);
  });

  test('should update order status', async () => {
    const order = new Order({ _id: uuidv4(), userId: user._id, productId: product._id, quantity: 1, status: 'pending' });
    await order.save();

    const res = await request(server)
      .put(`/order/${order._id}/stats`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'shipped' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('order status updated');
    expect(res.body.order).toHaveProperty('status', 'shipped');
  });

  test('should cancel an order', async () => {
    const order = new Order({ _id: uuidv4(), userId: user._id, productId: product._id, quantity: 1, status: 'pending' });
    await order.save();

    const res = await request(server)
      .patch(`/order/${order._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('order cancelled successfully');
    const cancelledOrder = await Order.findById(order._id);
    expect(cancelledOrder).toHaveProperty('status', 'cancelled');
  });

  test('should delete an order', async () => {
    const order = new Order({ _id: uuidv4(), userId: user._id, productId: product._id, quantity: 1 });
    await order.save();

    const res = await request(server)
      .delete(`/order/${order._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('order deleted successfully');
    const deletedOrder = await Order.findById(order._id);
    expect(deletedOrder).toBeNull();
  });
});