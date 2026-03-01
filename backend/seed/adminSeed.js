const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/tshirt-store')
  .then(() => console.log('MongoDB connected'))
  .catch(console.log);

const seedAdmin = async () => {
  try {
    // Remove existing admin if any
    await User.deleteOne({ username: 'admin' });

    const admin = new User({
      username: 'admin',
      email: 'admin@store.com',
      role: 'admin'
    });

    await User.register(admin, 'admin123'); // change password as you like
    console.log('✅ Admin user created: username=admin password=admin123');
    process.exit();
  } catch (err) {
    console.error('❌ Failed:', err);
    process.exit(1);
  }
};

seedAdmin();