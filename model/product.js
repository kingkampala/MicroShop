const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ProductSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;