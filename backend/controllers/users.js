// backend/controllers/users.js
const User = require('../models/User');
const passport = require('passport');
const userController = require('../controllers/users');

module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });

    // Register user (passport-local-mongoose handles hashing)
    const registeredUser = await User.register(user, password);

    // Auto-login after registration
    req.login(registeredUser, (err) => {
      if (err) {
        return res.status(500).json({
          message: 'Registration succeeded but login failed'
        });
      }

      // Return JSON instead of redirect
      return res.json({
        message: 'Registration successful',
        user: {
          id: registeredUser._id,
          username: registeredUser.username,
          email: registeredUser.email
        }
      });
    });
  } catch (err) {
    // Handle errors (like duplicate username)
    res.status(400).json({
      message: err.message || 'Registration failed'
    });
  }
};


module.exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    if (!user) {
      return res.status(401).json({
        message: info?.message || 'Invalid username or password'
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Login failed' });
      }

      // Call your controller's success handler
      userController.loginSuccess(req, res);
    });
  })(req, res, next);
};


module.exports.loginSuccess = (req, res) => {
  // Return JSON instead of redirect
  res.json({
    message: 'Login successful',
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    // Return JSON instead of redirect
    res.json({ message: 'Logged out successfully' });
  });
};

// NEW: Check if user is authenticated (useful for React)
module.exports.checkAuth = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } else {
    res.json({ isAuthenticated: false });
  }
};


