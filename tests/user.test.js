const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { JWT_SECRET } = process.env;

describe('User Service', () => {
  let server;
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: 'microshop',
      /*useNewUrlParser: true,
      useUnifiedTopology: true,*/
      serverSelectionTimeoutMS: 120000
    });

    server = app.listen(0, () => {
      console.log('test server running...');
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
    await User.deleteMany({});
  });

  test('should register a new user', async () => {
    const res = await request(server)
      .post('/user/register')
      .send({ username: 'testuser', password: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user registered successfully');
  });

  test('should login an existing user', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({ username: 'testuser', password: hashedPassword });
    await user.save();

    const res = await request(server)
      .post('/user/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  test('should update a user', async () => {
    const user = new User({ username: 'testuser', password: 'password123' });
    await user.save();

    const res = await request(server)
      .put(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'updateduser', newPassword: 'newpassword123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user updated successfully');
  });

  test('should delete a user', async () => {
    const user = new User({ username: 'testuser', password: 'password123' });
    await user.save();

    const res = await request(server)
      .delete(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  test('should get all users', async () => {
    const res = await request(server)
      .get('/user')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should get a user by ID', async () => {
    const user = new User({ username: 'testuser', password: 'password123' });
    await user.save();

    const res = await request(server)
      .get(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', 'testuser');
  });
});