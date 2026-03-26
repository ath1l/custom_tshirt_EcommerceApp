require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

const MONGO_URL =
  process.env.MONGO_URL || "mongodb://localhost:27017/tshirt-store";

const categories = [
  {
    name: "T-Shirt",
    slug: "tshirt",
    image: "/category thumb/t shirt.webp",
  },
  {
    name: "Hoodie",
    slug: "hoodie",
    image: "/category thumb/hoodies.webp",
  },
  {
    name: "Sweatshirt",
    slug: "sweatshirt",
    image: "/category thumb/sweatshirt.png",
  },
];

const products = [
  {
    name: "Blue T Shirt",
    type: "tshirt",
    category: "tshirt",
    price: 399,
    image: "/apparel/thumbnails/blue t shirt thumb.jpg",
    baseImage: "/apparel/editor/blue t shirt.png",
    backImage: "/apparel/editor back/blue t shirt.png",
    galleryImages: [],
    description:
      "A clean blue t shirt with a smooth print area, built for everyday wear and custom artwork.",
  },
  {
    name: "Green T Shirt",
    type: "tshirt",
    category: "tshirt",
    price: 399,
    image: "/apparel/thumbnails/green t shirt thumb.jpg",
    baseImage: "/apparel/editor/green t shirt.png",
    backImage: "/apparel/editor back/green t shirt.png",
    galleryImages: [],
    description:
      "A fresh green t shirt with a comfortable fit and a simple layout for bold personalized designs.",
  },
  {
    name: "Grey T Shirt",
    type: "tshirt",
    category: "tshirt",
    price: 399,
    image: "/apparel/thumbnails/grey t shirt thumb.jpg",
    baseImage: "/apparel/editor/grey t shirt.png",
    backImage: "/apparel/editor back/grey t shirt.png",
    galleryImages: ["/apparel/gallery/grey t shirt.png"],
    description:
      "A neutral grey t shirt that works as a versatile canvas for minimal, graphic, or branded prints.",
  },
  {
    name: "Red T Shirt",
    type: "tshirt",
    category: "tshirt",
    price: 399,
    image: "/apparel/thumbnails/red t shirt thumb.jpg",
    baseImage: "/apparel/editor/red t shirt.png",
    backImage: "/apparel/editor back/red t shirt.png",
    galleryImages: [
      "/apparel/gallery/red t shirt 1.png",
      "/apparel/gallery/red t shirt 2.png",
    ],
    description:
      "A bold red t shirt with a standout look, ideal for statement prints and custom branding.",
  },
  {
    name: "White T Shirt",
    type: "tshirt",
    category: "tshirt",
    price: 399,
    image: "/apparel/thumbnails/white t shirt thumb.jpg",
    baseImage: "/apparel/editor/white t shirt.png",
    backImage: "/apparel/editor back/white t shirt.png",
    galleryImages: [],
    description:
      "A classic white t shirt with a crisp finish and a clean surface for any custom design.",
  },
  {
    name: "Black Hoodie",
    type: "hoodie",
    category: "hoodie",
    price: 849,
    image: "/apparel/thumbnails/Black Hoodie.png",
    baseImage: "/apparel/editor/Black Hoodie.png",
    backImage: "/apparel/editor back/Black hoodie.png",
    galleryImages: [],
    description:
      "A black hoodie with a premium casual feel, made for warm comfort and strong custom designs.",
  },
  {
    name: "Blue Hoodie",
    type: "hoodie",
    category: "hoodie",
    price: 849,
    image: "/apparel/thumbnails/blue hoodie.jpg",
    baseImage: "/apparel/editor/blue hoodie.png",
    backImage: "/apparel/editor back/blue hoodie.png",
    galleryImages: [],
    description:
      "A soft blue hoodie that combines everyday comfort with a roomy front panel for printing.",
  },
  {
    name: "Green Hoodie",
    type: "hoodie",
    category: "hoodie",
    price: 849,
    image: "/apparel/thumbnails/green hoodie.png",
    baseImage: "/apparel/editor/green hoodie.png",
    backImage: "/apparel/editor back/green hoodie.png",
    galleryImages: [
      "/apparel/gallery/green hoodie1.png",
      "/apparel/gallery/green hoodie2.png",
      "/apparel/gallery/green hoodie3.png",
    ],
    description:
      "A green hoodie with a relaxed fit and layered styling, great for streetwear or custom team wear.",
  },
  {
    name: "Orange Hoodie",
    type: "hoodie",
    category: "hoodie",
    price: 849,
    image: "/apparel/thumbnails/orange hoodie.png",
    baseImage: "/apparel/editor/orange hoodie.png",
    backImage: "/apparel/editor back/orange hoodie.png",
    galleryImages: [],
    description:
      "An orange hoodie with a bright, energetic look that makes custom graphics stand out clearly.",
  },
  {
    name: "White Hoodie",
    type: "hoodie",
    category: "hoodie",
    price: 849,
    image: "/apparel/thumbnails/white hoodie.png",
    baseImage: "/apparel/editor/white hoodie.png",
    backImage: "/apparel/editor back/white hoodie.png",
    galleryImages: [],
    description:
      "A white hoodie with a clean finish and soft feel, perfect for minimal branding and artwork.",
  },
  {
    name: "Blue Sweatshirt",
    type: "sweatshirt",
    category: "sweatshirt",
    price: 799,
    image: "/apparel/thumbnails/blue sweatshirt.png",
    baseImage: "/apparel/editor/blue sweatshirt.png",
    backImage: "/apparel/editor back/blue sweatshirt.png",
    galleryImages: [],
    description:
      "A blue sweatshirt with a cozy everyday fit and a smooth surface for custom decoration.",
  },
  {
    name: "Green Sweatshirt",
    type: "sweatshirt",
    category: "sweatshirt",
    price: 799,
    image: "/apparel/thumbnails/green sweatshirt.png",
    baseImage: "/apparel/editor/green sweatshirt.png",
    backImage: "/apparel/editor back/green sweatshirt.png",
    galleryImages: [],
    description:
      "A green sweatshirt designed for comfort, layering, and simple personalized prints.",
  },
  {
    name: "Grey Sweatshirt",
    type: "sweatshirt",
    category: "sweatshirt",
    price: 799,
    image: "/apparel/thumbnails/grey sweatshirt.png",
    baseImage: "/apparel/editor/grey sweatshirt.png",
    backImage: "/apparel/editor back/grey sweatshirt.png",
    galleryImages: [],
    description:
      "A grey sweatshirt with a balanced everyday style that pairs well with minimalist or bold artwork.",
  },
  {
    name: "Red Sweatshirt",
    type: "sweatshirt",
    category: "sweatshirt",
    price: 799,
    image: "/apparel/thumbnails/red sweatshirt.png",
    baseImage: "/apparel/editor/red sweatshirt.png",
    backImage: "/apparel/editor back/red sweatshirt.png",
    galleryImages: [],
    description:
      "A red sweatshirt with a vibrant look and a soft build that works well for custom designs.",
  },
  {
    name: "White Sweatshirt",
    type: "sweatshirt",
    category: "sweatshirt",
    price: 799,
    image: "/apparel/thumbnails/white sweatshirt.png",
    baseImage: "/apparel/editor/white sweatshirt.png",
    backImage: "/apparel/editor back/white sweatshirt.png",
    galleryImages: [],
    description:
      "A white sweatshirt with a clean, versatile look that gives your design full attention.",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected for seeding");

    await Category.deleteMany({});
    await Product.deleteMany({});

    await Category.insertMany(categories);
    const inserted = await Product.insertMany(products);

    console.log(
      `Seeded ${categories.length} categories and ${inserted.length} products successfully`
    );
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
