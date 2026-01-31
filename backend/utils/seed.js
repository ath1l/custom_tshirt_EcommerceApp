const mongoose = require('mongoose');
const Product = require('../models/Product');

// OPTIONAL helpers (keep structure future-ready)
const products = [
    {
        name: 'Classic White T-Shirt',
        price: 499,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        description: 'Simple white cotton t-shirt'
    },
    {
        name: 'Black Oversized T-Shirt',
        price: 699,
        image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1015&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        description: 'Oversized black tee for street style'
    },
    {
        name: 'Custom Print T-Shirt',
        price: 899,
        image: 'https://via.placeholder.com/300',
        description: 'Add your own design and text'
    }
];

// Local MongoDB connection
mongoose.connect('mongodb://localhost:27017/tshirt-store')
    .then(() => {
        console.log('Mongo Connection Open');
    })
    .catch(err => {
        console.log('Mongo Error');
        console.log(err);
    });

const seedDB = async () => {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Database Seeded');
};

seedDB().then(() => {
    mongoose.connection.close();
});
