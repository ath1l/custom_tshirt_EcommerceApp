const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/users');

// Register
router.post('/register', userController.register);

// Login - using Passport's custom callback for JSON response
router.post('/login', userController.login);

// Logout
router.post('/logout', userController.logout);

// Check authentication status 
router.get('/check-auth', userController.checkAuth);

module.exports = router;

