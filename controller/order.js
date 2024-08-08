const Order = require('../model/order');
const Product = require('../model/product');
const { deleteCache } = require('../cache/service');

const makeOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('product not found');
    }

    const newOrder = new Order({ userId, productId, quantity });
    await newOrder.save();

    await deleteCache('orders');

    res.status(201).json({ message: 'order created successfully', order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error creating order' });
  }
};

const getId = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ error: 'order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error fetching order' });
  }
};

const get = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error fetching orders' });
  }
};

const updateOrder = async (req, res) => {
    try {
      const orderId = req.params.id;
      const { productId, quantity } = req.body;
  
      const userId = req.user._id;
  
      const productExists = await Product.exists({ _id: productId });
      if (!productExists) {
        return res.status(404).json({ error: 'product not found' });
      }
  
      const order = await Order.findOneAndUpdate(
        { _id: orderId, userId },
        { productId, quantity },
        { new: true }
      );
  
      if (!order) {
        return res.status(404).json({ error: 'order not found' });
      }
  
      await deleteCache(`order:${orderId}`);
      await deleteCache('orders');
  
      res.status(200).json({ message: 'order updated', order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'error updating order' });
    }
};  

const updateStats = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const userId = req.user._id;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'order not found' });
    }

    order.status = status;
    await order.save();

    await deleteCache(`order:${id}`);
    await deleteCache('orders');

    res.status(200).json({ message: 'order status updated', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error updating order' });
  }
};

const cancel = async (req, res) => {
    try {
      const orderId = req.params.id;
      const userId = req.user._id;
  
      const order = await Order.findOneAndUpdate(
        { _id: orderId, userId, status: 'pending' },
        { status: 'cancelled' },
        { new: true }
      );
  
      if (!order) {
        return res.status(404).json({ error: 'order not found or cannot be cancelled' });
      }
  
      res.status(200).json({ message: 'order cancelled successfully', order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'error cancelling order' });
    }
};

const remove = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    const order = await Order.findOneAndDelete({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ error: 'order not found' });
    }

    res.status(200).json({ message: 'order deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error deleting order' });
  }
};

module.exports = { makeOrder, getId, get, updateOrder, updateStats, cancel, remove };