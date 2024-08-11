const request = require('supertest');
const { app, connectDb } = require('../src/app');
const mongoose = require('mongoose');
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Redis = require('ioredis');
require('dotenv').config({ path: '.env.test' });

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
    await connectDb();

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
      .send({ name: 'test user', username: uniqueUsername, email: uniqueEmail, password: 'Password123!', confirmPassword: 'Password123!' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user registered successfully');
  });

  test('should return error for duplicate username (case insensitive)', async () => {
    // register the first user
    await request(server)
      .post('/user/register')
      .send({ 
        name: 'test user', 
        username: uniqueUsername.toLowerCase(), 
        email: uniqueEmail, 
        password: 'Password123!', 
        confirmPassword: 'Password123!' 
      });

    // attempt to register another user with the same username but different case
    const res = await request(server)
      .post('/user/register')
      .send({ 
        name: 'test user', 
        username: uniqueUsername.toUpperCase(), 
        email: `new_${uniqueEmail}`, 
        password: 'Password123!', 
        confirmPassword: 'Password123!' 
      });

    expect(res.statusCode).toBe(409);
    expect(res.text).toBe('username already exists');
  });

  test('should return error for duplicate email (case insensitive)', async () => {
    // register the first user
    await request(server)
      .post('/user/register')
      .send({ 
        name: 'test user', 
        username: uniqueUsername, 
        email: uniqueEmail.toLowerCase(), 
        password: 'Password123!', 
        confirmPassword: 'Password123!' 
      });

    // attempt to register another user with the same email but different case
    const res = await request(server)
      .post('/user/register')
      .send({ 
        name: 'test user', 
        username: `new_${uniqueUsername}`, 
        email: uniqueEmail.toUpperCase(), 
        password: 'Password123!', 
        confirmPassword: 'Password123!' 
      });

    expect(res.statusCode).toBe(409);
    expect(res.text).toBe('email already exists');
  });

  test('should login an existing user', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const user = new User({ 
      username: uniqueUsername, 
      email: uniqueEmail, 
      password: hashedPassword 
    });
    await user.save();

    const resByUsername = await request(server)
      .post('/user/login')
      .send({ loginIdentifier: uniqueUsername, password: 'Password123!' });

    expect(resByUsername.statusCode).toBe(200);
    expect(resByUsername.body).toHaveProperty('accessToken');

    const resByEmail = await request(server)
      .post('/user/login')
      .send({ loginIdentifier: uniqueEmail, password: 'Password123!' });

    expect(resByEmail.statusCode).toBe(200);
    expect(resByEmail.body).toHaveProperty('accessToken');
  });

  test('should update a user', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const user = new User({ username: uniqueUsername, email: uniqueEmail, password: hashedPassword });
    await user.save();
    const res = await request(server)
      .put(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: `updated_${uniqueUsername}`, email: `updated_${uniqueEmail}`, newPassword: 'NewPassword123!' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user updated successfully');

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.username).toBe(`updated_${uniqueUsername}`);
    expect(updatedUser.email).toBe(`updated_${uniqueEmail}`);

    const isPasswordMatch = await bcrypt.compare('NewPassword123!', updatedUser.password);
    expect(isPasswordMatch).toBe(true);
  });

  test('should return 409 if username already exists', async () => {
    const existingUser = new User({ username: `existing_${uniqueUsername}`, email: `existing_${uniqueEmail}`, password: 'Password123!' });
    await existingUser.save();

    const user = new User({ username: uniqueUsername, email: uniqueEmail, password: 'Password123!' });
    await user.save();

    const res = await request(server)
      .put(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: `existing_${uniqueUsername}` });

    expect(res.statusCode).toBe(409);
    expect(res.text).toBe('username already exists');
});

  test('should return 409 if email already exists', async () => {
      const existingUser = new User({ username: uniqueUsername, email: uniqueEmail, password: 'Password123!' });
      await existingUser.save();

      const uniqueUsername1 = `testuser1_${Date.now()}`;
      const uniqueEmail1 = `testemail1_${Date.now()}`;
      const user = new User({ username: uniqueUsername1, email: uniqueEmail1, password: 'Password123!' });
      await user.save();

      const res = await request(server)
        .put(`/user/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: uniqueEmail });

      expect(res.statusCode).toBe(409);
      expect(res.text).toBe('email already exists');
  });

  test('should return 400 if password does not meet criteria', async () => {
      const user = new User({ username: uniqueUsername, email: uniqueEmail, password: 'Password123!' });
      await user.save();

      const res = await request(server)
        .put(`/user/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword: 'short' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('does not meet password requirements');
  });

  test('should delete a user', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
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
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const user = new User({ username: uniqueUsername, email: uniqueEmail, password: hashedPassword });
    await user.save();
    const res = await request(server)
      .get(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', uniqueUsername);
  });
});