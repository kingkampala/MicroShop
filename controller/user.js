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

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log('password does not match');
        return res.status(401).send('invalid username or password');
      }
  
      const accessToken = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ accessToken });
    } catch (error) {
      console.error(error);
      res.status(500).send('error logging in');
    }
};

const update = async (req, res) => {
  try {
      const { username, newPassword } = req.body;
      const userId = req.params.id;

      if (!userId || !username || !newPassword) {
          return res.status(400).send('user ID, username, and new password are required');
      }

      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).send('user not found');
      }

      user.username = username;
      user.password = await bcrypt.hash(newPassword, 10);

      await user.save();

      res.status(200).send({'user updated successfully': user});
  } catch (error) {
      console.error(error);
      res.status(500).send('error updating user');
  }
};

const remove = async (req, res) => {
  try {
      const userId = req.params.id;

      if (!userId) {
          return res.status(400).send('user ID is required');
      }

      const user = await User.findByIdAndDelete(userId);

      if (!user) {
          return res.status(404).send('user not found');
      }

      res.status(200).send('user deleted successfully');
  } catch (error) {
      console.error(error);
      res.status(500).send('error deleting user');
  }
};

const get = async (req, res) => {
  try {
    const users = await User.find({});
    return users;
  } catch (error) {
    console.error('error fetching users:', error);
    res.status(500).json({ error: 'internal server error' });
  }
};

const getId = async (req, res) => {
  try {
    const userId = req.params.id

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('user not found');
    }
    return user;
  } catch (error) {
    console.error('error fetching users:', error);
    res.status(500).json({ error: 'internal server error' });
  }
};

module.exports = {register, login, update, remove, get, getId};