const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,

    // Image shown on Home page card
    image: String,

    // Base image used in Fabric canvas
    baseImage: String,

    description: String,

     type: {
        type: String,
        enum: ['tshirt', 'hoodie', 'shirt'],
        default: 'tshirt',
    },
});

module.exports = mongoose.model("Product", productSchema);


