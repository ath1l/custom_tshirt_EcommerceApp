const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { isLoggedIn, isAdmin } = require('../middleware');

router.get('/orders', isLoggedIn, isAdmin, adminController.getAllOrders);
router.post('/products', isLoggedIn, isAdmin, adminController.addProduct);
router.delete('/products/:id', isLoggedIn, isAdmin, adminController.deleteProduct);

module.exports = router;