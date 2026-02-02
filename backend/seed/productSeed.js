const mongoose = require("mongoose");
const Product = require("../models/Product");

// ✅ Local MongoDB connection (same as your app)
mongoose
    .connect("mongodb://localhost:27017/tshirt-store")
    .then(() => console.log("MongoDB connected for seeding"))
    .catch(console.log);

const products = [
    {
        name: "Black T-Shirt",
        price: 499,
        image: "/products/black-thumb.png",
        baseImage: "/tshirts/black.png",
        description: "Premium black cotton T-shirt",
    },
    {
        name: "White T-Shirt",
        price: 499,
        image: "/products/white-thumb.png",
        baseImage: "/tshirts/white.png",
        description: "Classic white cotton T-shirt",
    },
    {
        name: "Red T-Shirt",
        price: 549,
        image: "/products/red-thumb.png",
        baseImage: "/tshirts/red.png",
        description: "Stylish red cotton T-shirt",
    },
];

const seedProducts = async () => {
    try {
        // Clear existing products
        await Product.deleteMany();

        // Insert new products
        await Product.insertMany(products);

        console.log("✅ Products seeded successfully");
        process.exit();
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedProducts();
