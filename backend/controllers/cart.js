const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');

// GET cart
module.exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart) return res.json({ items: [] });
    const cartData = cart.toObject();
    cartData.items = [...cartData.items].reverse();
    res.json(cartData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

// ADD item to cart
module.exports.addToCart = async (req, res) => {
  try {
    const { productId, designJSON, previewImage, previewImages, material, quantity } = req.body;
    const product = await Product.findById(productId);
    const normalizedQuantity = Math.max(1, Number(quantity) || 1);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.isOutOfStock) {
      return res.status(400).json({ message: 'This product is out of stock' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    cart.items.push({
      productId,
      designJSON,
      previewImage,
      previewImages: {
        front: previewImages?.front || '',
        back: previewImages?.back || '',
      },
      material,
      quantity: normalizedQuantity,
    });
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

module.exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (req.body.quantity !== undefined) {
      item.quantity = Math.max(1, Number(req.body.quantity) || 1);
    }

    if (req.body.designJSON !== undefined) {
      item.designJSON = req.body.designJSON;
    }

    if (req.body.previewImage !== undefined) {
      item.previewImage = req.body.previewImage;
    }

    if (req.body.previewImages !== undefined) {
      item.previewImages = {
        front: req.body.previewImages?.front || '',
        back: req.body.previewImages?.back || '',
      };
    }

    if (req.body.material !== undefined) {
      item.material = req.body.material;
    }

    cart.updatedAt = Date.now();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.productId');
    res.json({ message: 'Cart quantity updated', cart: populatedCart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update cart quantity' });
  }
};

// CHECKOUT — convert all cart items to orders
module.exports.checkoutCart = async (req, res) => {
  try {
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
          totalPrice: item.productId.price * item.quantity,
          customization: {
            designJSON: item.designJSON,
            previewImage: item.previewImage,
            previewImages: {
              front: item.previewImages?.front || '',
              back: item.previewImages?.back || '',
            },
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
