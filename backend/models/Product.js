const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,

    // Image shown on Home page card
    image: String,

    // Base image used in Fabric canvas
    baseImage: String,

    // Optional back image used in Fabric canvas
    backImage: String,

    // Optional gallery images for the product detail page
    galleryImages: {
        type: [String],
        default: [],
    },

    isOutOfStock: {
        type: Boolean,
        default: false,
    },

    description: String,

    type: {
        type: String,
        default: 'tshirt',
        trim: true,
    },
});

module.exports = mongoose.model("Product", productSchema);


