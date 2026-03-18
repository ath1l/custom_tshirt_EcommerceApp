const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { isLoggedIn, isAdmin } = require('../middleware');

router.get('/orders', isLoggedIn, isAdmin, adminController.getAllOrders);
router.patch('/orders/:id/status', isLoggedIn, isAdmin, adminController.updateOrderStatus);
router.get('/categories', isLoggedIn, isAdmin, adminController.getAllCategories);
router.post('/categories', isLoggedIn, isAdmin, adminController.addCategory);
router.put('/categories/:id', isLoggedIn, isAdmin, adminController.editCategory);
router.delete('/categories/:id', isLoggedIn, isAdmin, adminController.deleteCategory);
router.post('/products', isLoggedIn, isAdmin, adminController.addProduct);
router.put('/products/:id', isLoggedIn, isAdmin, adminController.editProduct);
router.delete('/products/:id', isLoggedIn, isAdmin, adminController.deleteProduct);

module.exports = router;
