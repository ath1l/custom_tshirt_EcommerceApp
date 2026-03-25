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

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// routes
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payment');

// =======================
// MongoDB
// =======================
mongoose
  .connect(process.env.MONGO_URL || 'mongodb://localhost:27017/tshirt-store')
  .then(() => console.log('MongoDB connected'))
  .catch(console.log);

// =======================
// App config
// =======================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// Session + Passport
// =======================
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'thisisnotagoodsecret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Local strategy
passport.use(new LocalStrategy(User.authenticate()));

// Google strategy
const hasGoogleAuth =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
  Boolean(process.env.GOOGLE_CALLBACK_URL);

if (hasGoogleAuth) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({ googleId: profile.id });
          if (existingUser) return done(null, existingUser);

          const emailFromGoogle = profile.emails?.[0]?.value;
          const userWithEmail = await User.findOne({ email: emailFromGoogle });
          if (userWithEmail) {
            userWithEmail.googleId = profile.id;
            await userWithEmail.save();
            return done(null, userWithEmail);
          }

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
    )
  );
} else {
  console.warn(
    'Google OAuth is disabled because GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_CALLBACK_URL is missing.'
  );
}

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =======================
// Google OAuth routes
// =======================
if (hasGoogleAuth) {
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get(
    '/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: 'http://localhost:5173/login?error=google_failed',
    }),
    (req, res) => {
      res.redirect('http://localhost:5173/products');
    }
  );
} else {
  app.get('/auth/google', (req, res) => {
    res.status(503).json({ message: 'Google login is not configured on this server.' });
  });

  app.get('/auth/google/callback', (req, res) => {
    res.status(503).json({ message: 'Google login is not configured on this server.' });
  });
}

// =======================
// Routes
// =======================
app.use('/', userRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
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
