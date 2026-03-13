const express = require('express');
const router = express.Router();
const cart = require('../controllers/cart');
const { isLoggedIn } = require('../middleware');

router.get('/', isLoggedIn, cart.getCart);
router.post('/', isLoggedIn, cart.addToCart);
router.patch('/item/:itemId', isLoggedIn, cart.updateCartItemQuantity);
router.delete('/item/:itemId', isLoggedIn, cart.removeFromCart);
router.post('/checkout', isLoggedIn, cart.checkoutCart);

module.exports = router;
