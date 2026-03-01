const Order = require('../models/Order');
const Product = require('../models/Product');

module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'username email')
      .populate('productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

module.exports.addProduct = async (req, res) => {
  try {
    const { name, price, image, baseImage, description, type } = req.body;
    const product = new Product({ name, price, image, baseImage, description });
    product.type = type;  // set separately to avoid Mongoose's 'type' keyword conflict
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product' });
  }
};

module.exports.editProduct = async (req, res) => {
  try {
    const { name, price, image, baseImage, description, type } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.name = name;
    product.price = price;
    product.image = image;
    product.baseImage = baseImage;
    product.description = description;
    product.type = type;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to edit product' });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};