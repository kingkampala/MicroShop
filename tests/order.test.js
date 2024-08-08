const request = require('supertest');
const { app, connectDb } = require('../src/app');
const mongoose = require('mongoose');
const Order = require('../model/order');
const User = require('../model/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET, MONGO_URI } = process.env;

describe('Order Service', () => {
  let server;
  let token;
  let userId;
  let productId;

  beforeAll(async () => {
    await connectDb(MONGO_URI);

    server = app.listen(0, () => {
      console.log('Test server is running...');
    });

    // Create a test user
    const testUser = new User({ username: 'testuser', password: 'password123' });
    await testUser.save();
    userId = testUser._id;
    token = jwt.sign({ username: testUser.username }, JWT_SECRET, { expiresIn: '1h' });

    // Assume a productId is available from the Product Service (can be mocked if necessary)
    productId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    await Order.deleteMany({});
  });
});

test('should create a new order', async () => {
    const orderData = {
      userId: userId.toString(),
      productId: productId.toString(),
      quantity: 2,
    };
  
    const res = await request(server)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);
  
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('order created successfully');
    expect(res.body.order).toMatchObject(orderData);
});

test('should retrieve all orders', async () => {
    // Create a couple of test orders
    const order1 = new Order({ userId, productId, quantity: 1 });
    const order2 = new Order({ userId, productId, quantity: 3 });
    await order1.save();
    await order2.save();
  
    const res = await request(server)
      .get('/order')
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
});

test('should retrieve an order by ID', async () => {
    const order = new Order({ userId, productId, quantity: 2 });
    await order.save();
  
    const res = await request(server)
      .get(`/order/${order._id}`)
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', order._id.toString());
});

test('should update order status', async () => {
    const order = new Order({ userId, productId, quantity: 2, status: 'pending' });
    await order.save();
  
    const res = await request(server)
      .put(`/order/${order._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'shipped' });
  
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'shipped');
});

test('should delete an order', async () => {
    const order = new Order({ userId, productId, quantity: 2 });
    await order.save();
  
    const res = await request(server)
      .delete(`/order/${order._id}`)
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'order deleted successfully');
});  