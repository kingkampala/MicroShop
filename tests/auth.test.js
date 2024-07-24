const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');
const { mockRequest, mockResponse, mockNext } = require('./utils');

process.env.JWT_SECRET = 'testsecret';

describe('Auth Middleware', () => {
  it('should return 401 if no token is provided', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('access denied. no token provided.');
  });

  it('should return 403 if token is invalid', () => {
    const req = mockRequest({ headers: { authorization: 'Bearer invalidtoken' } });
    const res = mockResponse();
    const next = mockNext();

    jwt.verify = jest.fn((token, secret, callback) => callback(new Error('invalid token'), null));

    authenticateToken(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('should call next if token is valid', () => {
    const req = mockRequest({ headers: { authorization: 'Bearer validtoken' } });
    const res = mockResponse();
    const next = mockNext();

    jwt.verify = jest.fn((token, secret, callback) => callback(null, { username: 'testuser' }));

    authenticateToken(req, res, next);

    expect(req.user).toEqual({ username: 'testuser' });
    expect(next).toHaveBeenCalled();
  });
});