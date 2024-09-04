const request = require('supertest');
const { app, connectDb } = require('../src/app');
const mongoose = require('mongoose');
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Redis = require('ioredis');
const sendEmail = require('../email/service');
require('dotenv').config({ path: '.env.test' });

const { JWT_SECRET, MONGO_URI } = process.env;

jest.mock('ioredis', () => require('ioredis-mock'));
jest.mock('../email/service', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

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
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    await User.deleteMany({ username: new RegExp(`^${uniqueUsername}`) });
    await redisClient.flushall();
  });

  afterEach(async () => {
    await redisClient.flushall();
  });

  test('should register a new user and handle validation errors', async () => {
    // register a valid new user
    const res1 = await request(server)
      .post('/user/register')
      .send({ 
        name: 'test user', 
        username: 'testuser',//uniqueUsername, 
        email: 'testuser@example.com',//uniqueEmail, 
        password: 'Password123!', 
        confirmPassword: 'Password123!' 
      });

      console.log('Response:', res1.statusCode, res1.body);
  
    expect(res1.statusCode).toBe(201);
    expect(res1.body).toHaveProperty('user registered successfully');
  
    // missing fields
    const res2 = await request(server)
      .post('/user/register')
      .send({ 
        name: '', 
        username: uniqueUsername, 
        email: uniqueEmail, 
        password: 'Password123!', 
        confirmPassword: 'Password123!' 
      });
  
    expect(res2.statusCode).toBe(400);
    expect(res2.text).toBe('registration details are required complete');
  
    // invalid email format
    const res3 = await request(server)
      .post('/user/register')
      .send({ 
        name: 'test user', 
        username: uniqueUsername, 
        email: 'invalidEmail', 
        password: 'Password123!', 
        confirmPassword: 'Password123!' 
      });
  
    expect(res3.statusCode).toBe(400);
    expect(res3.text).toBe('invalid email format');
  
    // invalid password format
    const res4 = await request(server)
      .post('/user/register')
      .send({ 
        name: 'test user', 
        username: uniqueUsername, 
        email: uniqueEmail, 
        password: 'pass',
        confirmPassword: 'pass' 
      });
  
    expect(res4.statusCode).toBe(400);
    expect(res4.body.error).toBe('pass does not meet password requirements, it must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.');
  
    // password mismatch
    const res5 = await request(server)
      .post('/user/register')
      .send({ 
        name: 'test user', 
        username: uniqueUsername, 
        email: uniqueEmail, 
        password: 'Password123!', 
        confirmPassword: 'Password1234!' 
      });
  
    expect(res5.statusCode).toBe(400);
    expect(res5.body.error).toBe('passwords do not match.');
  
    // duplicate username (case insensitive)
    const res6 = await request(server)
      .post('/user/register')
      .send({ 
        name: 'test user', 
        username: uniqueUsername.toUpperCase(), 
        email: `new_${uniqueEmail}`, 
        password: 'Password123!', 
        confirmPassword: 'Password123!' 
      });
  
    expect(res6.statusCode).toBe(409);
    expect(res6.text).toBe('username already exists');
  
    // duplicate email (case insensitive)
    const res7 = await request(server)
      .post('/user/register')
      .send({ 
        name: 'test user', 
        username: `new_${uniqueUsername}`, 
        email: uniqueEmail.toUpperCase(), 
        password: 'Password123!', 
        confirmPassword: 'Password123!' 
      });
  
    expect(res7.statusCode).toBe(409);
    expect(res7.text).toBe('email already exists');
  });

  test('should handle login scenarios correctly', async () => {
    // login with valid username and correct password
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
  
    // login with valid email and correct password
    const resByEmail = await request(server)
      .post('/user/login')
      .send({ loginIdentifier: uniqueEmail, password: 'Password123!' });
  
    expect(resByEmail.statusCode).toBe(200);
    expect(resByEmail.body).toHaveProperty('accessToken');
  
    // missing loginIdentifier or password
    const resMissingIdentifier = await request(server)
      .post('/user/login')
      .send({ password: 'Password123!' });
  
    expect(resMissingIdentifier.statusCode).toBe(400);
    expect(resMissingIdentifier.text).toBe('username or email and password are required');
  
    const resMissingPassword = await request(server)
      .post('/user/login')
      .send({ loginIdentifier: uniqueUsername });
  
    expect(resMissingPassword.statusCode).toBe(400);
    expect(resMissingPassword.text).toBe('username or email and password are required');
  
    // invalid email format
    const resInvalidEmail = await request(server)
      .post('/user/login')
      .send({ loginIdentifier: 'invalidEmail', password: 'Password123!' });
  
    expect(resInvalidEmail.statusCode).toBe(401);
    expect(resInvalidEmail.text).toBe('invalid email or password');
  
    // incorrect password with valid email
    const resIncorrectPasswordEmail = await request(server)
      .post('/user/login')
      .send({ loginIdentifier: uniqueEmail, password: 'WrongPassword' });
  
    expect(resIncorrectPasswordEmail.statusCode).toBe(401);
    expect(resIncorrectPasswordEmail.text).toBe('invalid email or password');
  
    // incorrect password with valid username
    const resIncorrectPasswordUsername = await request(server)
      .post('/user/login')
      .send({ loginIdentifier: uniqueUsername, password: 'WrongPassword' });
  
    expect(resIncorrectPasswordUsername.statusCode).toBe(401);
    expect(resIncorrectPasswordUsername.text).toBe('invalid username or password');
  
    // server error handling (mocked for testing purposes)
    jest.spyOn(User, 'findOne').mockImplementation(() => { throw new Error('database Error'); });
  
    const resServerError = await request(server)
      .post('/user/login')
      .send({ loginIdentifier: uniqueUsername, password: 'Password123!' });
  
    expect(resServerError.statusCode).toBe(500);
    expect(resServerError.body.error).toBe('error logging user');
  });

  test('should handle reset password scenarios correctly', async () => {
    // successful password reset
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const user = new User({
      _id: userId,
      username: uniqueUsername,
      email: uniqueEmail,
      password: hashedPassword,
    });
    await user.save();
  
    const resSuccessfulReset = await request(server)
      .patch(`/user/${user._id}/reset`)
      .send({ password: 'Password123!', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' });
  
    expect(resSuccessfulReset.statusCode).toBe(200);
    expect(resSuccessfulReset.body).toHaveProperty('password resetted successfully');
    const updatedUser = await User.findById(user._id);
    const isPasswordMatch = await bcrypt.compare('NewPassword123!', updatedUser.password);
    expect(isPasswordMatch).toBe(true);
    expect(deleteCache).toHaveBeenCalledWith(`user:${user._id}`);
    expect(deleteCache).toHaveBeenCalledWith('users');
    expect(sendEmail).toHaveBeenCalledWith(
      user.email,
      'Password Reset Successful',
      expect.stringContaining('your password has been successfully reset.')
    );
  
    // missing password, newPassword, or confirmPassword
    const resMissingFields = await request(server)
      .patch(`/user/${user._id}/reset`)
      .send({});
  
    expect(resMissingFields.statusCode).toBe(400);
    expect(resMissingFields.text).toBe('passwords are required');
  
    // user not found
    const resUserNotFound = await request(server)
      .patch(`/user/60d0fe4f5311236168a109cb/reset`)
      .send({ password: 'Password123!', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' });
  
    expect(resUserNotFound.statusCode).toBe(404);
    expect(resUserNotFound.text).toBe('user not found');
  
    // incorrect current password
    const resIncorrectPassword = await request(server)
      .patch(`/user/${user._id}/reset`)
      .send({ password: 'WrongPassword123!', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' });
  
    expect(resIncorrectPassword.statusCode).toBe(409);
    expect(resIncorrectPassword.text).toBe('wrong password.');
  
    // new password does not meet requirements
    const resWeakPassword = await request(server)
      .patch(`/user/${user._id}/reset`)
      .send({ password: 'Password123!', newPassword: 'weakpass', confirmPassword: 'weakpass' });
  
    expect(resWeakPassword.statusCode).toBe(400);
    expect(resWeakPassword.body.error).toContain('weakpass does not meet password requirements');
  
    // new password and confirm password do not match
    const resPasswordMismatch = await request(server)
      .patch(`/user/${user._id}/reset`)
      .send({ password: 'Password123!', newPassword: 'NewPassword123!', confirmPassword: 'DifferentPassword123!' });
  
    expect(resPasswordMismatch.statusCode).toBe(400);
    expect(resPasswordMismatch.body.error).toBe('passwords do not match.');
  
    // server error handling (mocked for testing purposes)
    jest.spyOn(User.prototype, 'save').mockImplementation(() => { throw new Error('Database Error'); });
  
    const resServerError = await request(server)
      .patch(`/user/${user._id}/reset`)
      .send({ password: 'Password123!', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' });
  
    expect(resServerError.statusCode).toBe(500);
    expect(resServerError.body.error).toBe('error resetting password');
  });

  test('should handle user update scenarios correctly', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const user = new User({ username: uniqueUsername, email: uniqueEmail, password: hashedPassword });
    await user.save();
  
    // successful update of username and email
    const resSuccessfulUpdate = await request(server)
      .put(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: `updated_${uniqueUsername}`, email: `updated_${uniqueEmail}` });

      if (resSuccessfulUpdate.statusCode !== 200) {
        console.error('Update failed with status code:', resSuccessfulUpdate.statusCode);
        console.error('Response body:', resSuccessfulUpdate.body);
      }
  
    expect(resSuccessfulUpdate.statusCode).toBe(200);
    expect(resSuccessfulUpdate.body).toHaveProperty('user updated successfully');
  
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.username).toBe(`updated_${uniqueUsername}`);
    expect(updatedUser.email).toBe(`updated_${uniqueEmail}`);
  
    // missing username, email, and password
    const resMissingFields = await request(server)
      .put(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
  
    expect(resMissingFields.statusCode).toBe(400);
    expect(resMissingFields.text).toBe('at least username, email, or new password is required');
  
    // no valid updates provided (same username and email)
    const resNoValidUpdates = await request(server)
      .put(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: uniqueUsername, email: uniqueEmail });
  
    expect(resNoValidUpdates.statusCode).toBe(400);
    expect(resNoValidUpdates.text).toBe('no valid updates provided');
  
    // username already exists
    const anotherUser = new User({ username: `updated_${uniqueUsername}`, email: 'anotheremail@example.com', password: hashedPassword });
    await anotherUser.save();
  
    const resUsernameExists = await request(server)
      .put(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: `updated_${uniqueUsername}`, email: `another${uniqueEmail}` });
  
    expect(resUsernameExists.statusCode).toBe(409);
    expect(resUsernameExists.text).toBe('username already exists');
  
    // invalid email format
    const resInvalidEmail = await request(server)
      .put(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'invalidEmailFormat' });
  
    expect(resInvalidEmail.statusCode).toBe(400);
    expect(resInvalidEmail.text).toBe('invalid email format');
  
    // email already exists
    const resEmailExists = await request(server)
      .put(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'anotheremail@example.com' });
  
    expect(resEmailExists.statusCode).toBe(409);
    expect(resEmailExists.text).toBe('email already exists');
  
    // user not found
    const resUserNotFound = await request(server)
      .put('/user/60d0fe4f5311236168a109cb')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: `new_${uniqueUsername}`, email: `new_${uniqueEmail}` });
  
    expect(resUserNotFound.statusCode).toBe(404);
    expect(resUserNotFound.text).toBe('user not found');
  
    // server error handling (mocked for testing purposes)
    jest.spyOn(User.prototype, 'save').mockImplementation(() => { throw new Error('database Error'); });
  
    const resServerError = await request(server)
      .put(`/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: `new_${uniqueUsername}`, email: `new_${uniqueEmail}` });
  
    expect(resServerError.statusCode).toBe(500);
    expect(resServerError.body.error).toBe('error updating user');
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