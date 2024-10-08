const Product = require('../model/product');
const { deleteCache } = require('../cache/service');

const get = async (req, res) => {
  try {
    const products = await Product.find();
    return products;
  } catch (err) {
    console.error('error fetching products:', err);
    return { data: null, status: 500 };
  }
};

const getId = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return { data: null, status: 404 };
    }
    return product;
  } catch (err) {
    console.error('error fetching product:', err);
    res.status(500).json({ error: 'server error' });
  }
};

const upload = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const newProduct = new Product({ name, price, description });
    await newProduct.save();

    await deleteCache('products');

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'server error', details: err.message });
  }
};

const update = async (req, res) => {
  try {
      const { name, newPrice } = req.body;
      const productId = req.params.id;
      if (!productId || !name || !newPrice) {
          return res.status(400).send('product id, name and price are required');
      }

      const product = await Product.findByIdAndUpdate(productId);

      if (!product) {
          return res.status(404).send('product not found');
      }

      product.name = name;
      product.price = newPrice;

      await product.save();

      await deleteCache(`product:${productId}`);
      await deleteCache('products');

      res.status(200).send({'product updated successfully': product});
    } catch (err) {
      res.status(500).json({ error: 'server error', details: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const productId = req.params.id;
  
        if (!productId) {
            return res.status(400).send('product ID is required');
        }
  
        const product = await Product.findByIdAndDelete(productId);
  
        if (!product) {
            return res.status(404).send('product not found');
        }
  
        res.status(200).send('product deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('error deleting product');
    }
  };

module.exports = {get, getId, upload, update, remove};