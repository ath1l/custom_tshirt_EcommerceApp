// backend/routes/users.js (or wherever your auth routes are)
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

// Check authentication status (NEW!)
router.get('/check-auth', userController.checkAuth);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const passport = require('passposrt');
// const users = require('../controllers/users');

// router.get('/register', users.registerForm);
// router.post('/register', users.register);

// router.get('/login', users.loginForm);
// router.post('/login',
//   passport.authenticate('local', { failureRedirect: '/login' }),
//   users.loginSuccess
// );

// router.get('/logout', users.logout);

// module.exports = router;
