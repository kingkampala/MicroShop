const jwt = require('jsonwebtoken');
require('dotenv').config();
//const { JWT_SECRET } = process.env;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).send('access denied. no token provided.');
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send('invalid or expired token.');
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;