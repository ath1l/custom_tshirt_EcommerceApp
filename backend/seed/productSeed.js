const mongoose = require("mongoose");
const Product = require("../models/Product");

mongoose
  .connect("mongodb://localhost:27017/tshirt-store")
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

const tshirtBases = ["/tshirts/black.png", "/tshirts/red.png", "/tshirts/white.png"];

const tshirtNames = [
  "Cotton Crew Neck T-Shirt",
  "V-Neck Cotton Tee",
  "Oversized Street T-Shirt",
  "Bio-Wash Graphic Tee",
  "Pocket Detail T-Shirt",
  "Athletic Fit Dry Tee",
  "Heavyweight Cotton Tee",
  "Relaxed Fit Weekend Tee",
  "Classic Plain T-Shirt",
  "Ribbed Neck Premium Tee",
];

const hoodieNames = [
  "Fleece Pullover Hoodie",
  "Zip-Up Cotton Hoodie",
  "Oversized Urban Hoodie",
  "Heavyweight Winter Hoodie",
  "Minimal Logo Hoodie",
  "Washed Vintage Hoodie",
  "Drop Shoulder Hoodie",
  "Athleisure Training Hoodie",
  "Soft Touch Lounge Hoodie",
  "Classic Campus Hoodie",
];

const shirtNames = [
  "Oxford Cotton Shirt",
  "Slim Fit Formal Shirt",
  "Casual Checked Shirt",
  "Linen Blend Summer Shirt",
  "Mandarin Collar Shirt",
  "Denim Style Casual Shirt",
  "Stretch Office Shirt",
  "Printed Vacation Shirt",
  "Classic White Shirt",
  "Textured Smart Shirt",
];

const makeImageUrl = (keywords, index) =>
  `https://loremflickr.com/900/900/${encodeURIComponent(keywords)}?lock=${index}`;

const makeProducts = () => {
  const list = [];

  for (let i = 1; i <= 18; i += 1) {
    list.push({
      name: `${tshirtNames[(i - 1) % tshirtNames.length]} ${i}`,
      price: 399 + ((i % 6) * 50),
      image: makeImageUrl("tshirt,cotton,fashion", i),
      baseImage: tshirtBases[(i - 1) % tshirtBases.length],
      description: `Comfort-fit cotton T-shirt style ${i} for daily wear and custom prints.`,
      type: "tshirt",
    });
  }

  for (let i = 1; i <= 16; i += 1) {
    list.push({
      name: `${hoodieNames[(i - 1) % hoodieNames.length]} ${i}`,
      price: 799 + ((i % 5) * 60),
      image: makeImageUrl("hoodie,streetwear,fashion", 100 + i),
      baseImage: tshirtBases[(i - 1) % tshirtBases.length],
      description: `Warm and durable hoodie variant ${i} suited for layering and personalization.`,
      type: "hoodie",
    });
  }

  for (let i = 1; i <= 16; i += 1) {
    list.push({
      name: `${shirtNames[(i - 1) % shirtNames.length]} ${i}`,
      price: 549 + ((i % 5) * 55),
      image: makeImageUrl("shirt,men,style", 200 + i),
      baseImage: tshirtBases[(i - 1) % tshirtBases.length],
      description: `Smart-casual shirt design ${i} with clean look for custom branding.`,
      type: "shirt",
    });
  }

  return list;
};

const seedProducts = async () => {
  try {
    const products = makeProducts();

    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log(`Seeded ${products.length} products successfully`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedProducts();
