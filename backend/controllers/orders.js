const Order = require('../models/Order');
const Product = require('../models/Product');

module.exports.createOrder = async (req, res) => {
  const product = await Product.findById(req.params.id);

  const order = new Order({
    user: req.user._id,
    product: product._id,
    priceAtPurchase: product.price,
    customization: {
      color: req.body.color,
      size: req.body.size,
      text: req.body.text
    }
  });

  await order.save();
  res.redirect('/orders');
};


// Get all orders for logged-in user 
module.exports.getUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('product');

  res.json(orders); // Return JSON instead of render
};

// module.exports.userOrders = async (req, res) => {
//   const orders = await Order.find({ user: req.user._id })
//     .populate('product');

//   res.render('orders/index', { orders });
// };
