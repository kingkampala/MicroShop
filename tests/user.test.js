const request = require('supertest');
const { app, connectDb } = require('../src/app');
const mongoose = require('mongoose');
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Redis = require('ioredis');
require('dotenv').config();

const { JWT_SECRET, MONGO_URI } = process.env;

jest.mock('ioredis', () => require('ioredis-mock'));

describe('User Service', () => {
  let server;
  let token;
  let redisClient;
  let uniqueUsername;
  let uniqueEmail;
  let userId;

  beforeAll(async () => {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set', Error.message);
    }
    await connectDb(MONGO_URI);

    server = app.listen(0, () => {
      console.log('test server is running...');
    });

    redisClient = new Redis();

    uniqueUsername = `testuser_${Date.now()}`;
    uniqueEmail = `testemail_${Date.now()}`;
    token = jwt.sign({ username: uniqueUsername }, JWT_SECRET, { expiresIn: '1h' });

    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({ username: uniqueUsername, email: uniqueEmail, password: hashedPassword });
    await user.save();
    userId = user._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (server) {
      server.close();
    }
    await redisClient.quit();
  });

  beforeEach(async () => {
    await User.deleteMany({ username: new RegExp(`^${uniqueUsername}`) });
    await redisClient.flushall();
  });

  afterEach(async () => {
    await redisClient.flushall();
  });

  test('should register a new user', async () => {
    const res = await request(server)
      .post('/user/register')
      .send({ name: 'test user', username: uniqueUsername, email: uniqueEmail, password: 'password123', confirmPassword: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user registered successfully');
  });

  test('should login an existing user', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({ 
      username: uniqueUsername, 
      email: uniqueEmail, 
      password: hashedPassword 
    });
    await user.save();

    const resByUsername = await request(server)
      .post('/user/login')
      .send({ loginIdentifier: uniqueUsername, password: 'password123' });

    expect(resByUsername.statusCode).toBe(200);
    expect(resByUsername.body).toHaveProperty('accessToken');

    const resByEmail = await request(server)
      .post('/user/login')
      .send({ loginIdentifier: uniqueEmail, password: 'password123' });

    expect(resByEmail.statusCode).toBe(200);
    expect(resByEmail.body).toHaveProperty('accessToken');
  });

  test('should update a user', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({ username: uniqueUsername, email: uniqueEmail, password: hashedPassword });
    await user.save();
    const res = await request(server)
      .put(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: `updated_${uniqueUsername}`, email: `updated_${uniqueEmail}`, newPassword: 'newpassword123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user updated successfully');
  });

  test('should delete a user', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({ username: uniqueUsername, email: uniqueEmail, password: hashedPassword });
    await user.save();
    const res = await request(server)
      .delete(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('user deleted successfully');
  });

  test('should get all users', async () => {
    const res = await request(server)
      .get('/user')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should get a user by ID', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({ username: uniqueUsername, email: uniqueEmail, password: hashedPassword });
    await user.save();
    const res = await request(server)
      .get(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', uniqueUsername);
  });
});