const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');

// GET cart
module.exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

// ADD item to cart
module.exports.addToCart = async (req, res) => {
  try {
    const { productId, designJSON, previewImage, material } = req.body;

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    cart.items.push({ productId, designJSON, previewImage, material });
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({ message: 'Added to cart', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
};

// REMOVE item from cart
module.exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    res.json({ message: 'Item removed', cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove item' });
  }
};

// CHECKOUT — convert all cart items to orders
module.exports.checkoutCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orders = await Promise.all(
      cart.items.map(item =>
        new Order({
          userId: req.user._id,
          productId: item.productId._id,
          totalPrice: item.productId.price * item.quantity,
          customization: {
            designJSON: item.designJSON,
            previewImage: item.previewImage,
            material: item.material,
          },
          quantity: item.quantity,
        }).save()
      )
    );

    // Clear the cart after checkout
    cart.items = [];
    await cart.save();

    res.json({ message: 'Order placed successfully', orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Checkout failed' });
  }
};