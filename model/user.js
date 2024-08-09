const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  name: {
    type: String,
    required: false
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
      },
      message: props => `${props.value} is not a valid password. it must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.`
    }
  },
  confirmPassword: {
    type: String,
    required: false,
    validate: {
      validator: function(value) {
        return value === this.password;
      },
      message: props => `${props.value} passwords do not match.`
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ username: 1, email: 1 }, { 
  unique: true,
  collation: { locale: 'en', strength: 4 }
});

const User = mongoose.model('User', userSchema);

module.exports = User;