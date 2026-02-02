const Order = require('../models/Order');
const Product = require('../models/Product');

module.exports.createOrder = async (req, res) => {
  try {
    const { productId, designJSON, previewImage } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const order = new Order({
      userId: req.user._id,      // ✅ FIX
      productId: product._id,    // ✅ FIX
      totalPrice: product.price,
      customization: {
        designJSON,
        previewImage,
      },
    });

    await order.save();
    res.json(order);
  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};



// Get all orders for logged-in user 
module.exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("productId");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};


