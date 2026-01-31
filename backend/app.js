const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const passport = require('passport');
const LocalStrategy = require('passport-local');
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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =======================
// Routes
// =======================

app.get('/', (req, res) => {
  res.redirect('/products');
});


app.use('/', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// =======================
// Server
// =======================
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
