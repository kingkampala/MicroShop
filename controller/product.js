const Product = require('../model/product');

const get = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
};

const getId = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
};

const post = async (req, res) => {
  try {
    const { name, price } = req.body;
    const newProduct = new Product({ name, price });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
};

module.exports = {get, getId, post};