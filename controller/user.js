const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/user');
const { deleteCache } = require('../cache/service');

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
    try {
      const { name, username, email, password, confirmPassword } = req.body;
  
      if (!name || !username || !email || !password | !confirmPassword) {
        return res.status(400).send('registration details are required complete');
      }
  
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).send('username already exists');
      }

      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).send('email already exists');
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'passwords do not match.' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, username, email, password: hashedPassword });
  
      await newUser.save();

      await deleteCache('users');
  
      res.status(201).send({'user registered successfully': newUser});
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'error registering user', details: error.message });
    }
};

const login = async (req, res) => {
    try {
      const { loginIdentifier, password } = req.body;
  
      if (!loginIdentifier || !password) {
        return res.status(400).send('username or email and password are required');
      }
  
      const user = await User.findOne({
        $or: [
          { username: loginIdentifier },
          { email: loginIdentifier }
        ]
      });
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('invalid username or password');
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log('password does not match');
        return res.status(401).send('invalid username or password');
      }
  
      const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ accessToken });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'error logging user', details: error.message });
    }
};

const update = async (req, res) => {
  try {
      const { username, newPassword } = req.body;
      const userId = req.params.id;

      if (!userId || !username || !newPassword) {
          return res.status(400).send('user ID, username, and new password are required');
      }

      const user = await User.findByIdAndUpdate(userId);

      if (!user) {
          return res.status(404).send('user not found');
      }

      user.username = username;
      user.password = await bcrypt.hash(newPassword, 10);

      await user.save();

      await deleteCache(`user:${userId}`);
      await deleteCache('users');

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
    return { data: null, status: 500 };
  }
};

const getId = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return { data: null, status: 404 };
    }
    return user;
  } catch (error) {
    console.error('error fetching user:', error);
    res.status(500).json({ error: 'internal server error' });
  }
};

module.exports = {register, login, update, remove, get, getId};