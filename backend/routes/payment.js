const express = require('express');
const router = express.Router();
const payment = require('../controllers/payment');
const { isLoggedIn } = require('../middleware');

router.post('/create-order', isLoggedIn, payment.createOrder);
router.post('/verify', isLoggedIn, payment.verifyAndFulfill);

module.exports = router;