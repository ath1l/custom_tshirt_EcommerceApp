const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /payment/create-order
// Body: { amount }   (amount in ₹ — we convert to paise here)
module.exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay createOrder error:', err);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// POST /payment/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, type, items?, singleItem? }
// type = 'cart'   → checkout all cart items
// type = 'single' → singleItem: { productId, designJSON, previewImage, material }
module.exports.verifyAndFulfill = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      type,
      singleItem,
    } = req.body;

    // ── 1. Verify signature ──────────────────────────────────────────────────
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // ── 2. Fulfill order ─────────────────────────────────────────────────────
    if (type === 'cart') {
      const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      const unavailableItems = cart.items.filter((item) => item.productId?.isOutOfStock);
      if (unavailableItems.length > 0) {
        return res.status(400).json({
          message: 'Remove out-of-stock products from your cart before checkout',
          unavailableProductIds: unavailableItems.map((item) => item.productId?._id),
        });
      }

      const orders = await Promise.all(
        cart.items.map(item =>
          new Order({
            userId: req.user._id,
            productId: item.productId._id,
            totalPrice: item.productId.price * (item.quantity || 1),
            customization: {
              designJSON: item.designJSON,
              previewImage: item.previewImage,
              material: item.material,
            },
            quantity: item.quantity || 1,
            paymentId: razorpay_payment_id,
          }).save()
        )
      );

      cart.items = [];
      await cart.save();

      return res.json({ message: 'Payment verified & orders placed', orders });
    }

    if (type === 'single') {
      const { productId, designJSON, previewImage, material, quantity } = singleItem;
      const normalizedQuantity = Math.max(1, Number(quantity) || 1);
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      if (product.isOutOfStock) {
        return res.status(400).json({ message: 'This product is out of stock' });
      }

      const order = await new Order({
        userId: req.user._id,
        productId: product._id,
        totalPrice: product.price * normalizedQuantity,
        customization: { designJSON, previewImage, material: material || 'Cotton' },
        quantity: normalizedQuantity,
        paymentId: razorpay_payment_id,
      }).save();

      return res.json({ message: 'Payment verified & order placed', order });
    }

    res.status(400).json({ message: 'Unknown order type' });
  } catch (err) {
    console.error('verifyAndFulfill error:', err);
    res.status(500).json({ message: 'Failed to fulfill order' });
  }
};
