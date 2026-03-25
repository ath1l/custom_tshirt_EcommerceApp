require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const User = require('./models/User');
const app = express();

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// routes
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payment');

// =======================
// MongoDB
// =======================
mongoose.connect('mongodb://localhost:27017/tshirt-store')
  .then(() => console.log('MongoDB connected'))
  .catch(console.log);

// =======================
// App config
// =======================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// Session + Passport
// =======================
app.use(session({
  secret: 'thisisnotagoodsecret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Local strategy (passport-local-mongoose handles this automatically) ──
passport.use(new LocalStrategy(User.authenticate()));

// ── Google strategy ──
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Already signed up with Google before? Just return the user.
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) return done(null, existingUser);

      // 2. Same email signed up with local auth before? Link accounts.
      const emailFromGoogle = profile.emails?.[0]?.value;
      const userWithEmail = await User.findOne({ email: emailFromGoogle });
      if (userWithEmail) {
        userWithEmail.googleId = profile.id;
        await userWithEmail.save();
        return done(null, userWithEmail);
      }

      // 3. Brand new user — create them.
      // passport-local-mongoose requires a username; we use the Google display name.
      // setPassword is not called, so no local password is set.
      const newUser = new User({
        username: profile.displayName || emailFromGoogle,
        email: emailFromGoogle,
        googleId: profile.id,
      });
      await newUser.save();
      return done(null, newUser);

    } catch (err) {
      return done(err, null);
    }
  }
));

// passport-local-mongoose provides these; they work for both local + Google users
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =======================
// Google OAuth routes
// (kept here, not in routes/users.js, because they involve redirects
//  and it's cleaner to see the full flow in one place)
// =======================

// Step 1 — redirect user to Google's consent screen
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Step 2 — Google redirects back here after the user approves
app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/login?error=google_failed',
  }),
  (req, res) => {
    // Success — send them back to the React app
    res.redirect('http://localhost:5173/products');
  }
);

// =======================
// Routes
// =======================
app.use('/', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/cart', cartRoutes);
app.use('/payment', paymentRoutes);

// =======================
// Server
// =======================
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});