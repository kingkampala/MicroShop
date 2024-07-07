const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/user');

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      if (!username || !password) {
        return res.status(400).send('username and password are required');
      }
  
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).send('username already exists');
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
  
      await newUser.save();
  
      res.status(201).send({'user registered successfully': newUser});
    } catch (error) {
      console.error(error);
      res.status(500).send('error registering user');
    }
};

const login = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      if (!username || !password) {
        return res.status(400).send('username and password are required');
      }
  
      const user = await User.findOne({ username });
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('invalid username or password');
      }
  
      const accessToken = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ accessToken });
    } catch (error) {
      console.error(error);
      res.status(500).send('error logging in');
    }
};

const get = async (req, res) => {
  try {
    const getall = await User.find();
    res.json(getall);
  } catch (error) {
    console.error('error fetching users:', error);
    res.status(500).json({ error: 'internal server error' });
  }
};

module.exports = {register, login, get};