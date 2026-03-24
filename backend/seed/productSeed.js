const mongoose = require("mongoose");
const Product = require("../models/Product");

mongoose
  .connect("mongodb://localhost:27017/tshirt-store")
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

<<<<<<< HEAD
// Base images for the Fabric.js canvas customizer
const bases = {
  tshirt: ["/tshirts/white.png", "/tshirts/black.png", "/tshirts/red.png"],
  hoodie: ["/tshirts/white.png", "/tshirts/black.png"],
  shirt:  ["/tshirts/white.png"],
=======
const tshirtBases = [
  "/apparel/editor/black.png",
  "/apparel/editor/red.png",
  "/apparel/editor/white.png",
];

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
>>>>>>> origin/main
};

const products = [
  // ── T-SHIRTS (8) ──────────────────────────────────────────────────────────
  {
    name: "Classic White Crew Tee",
    price: 399,
    type: "tshirt",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop",
    baseImage: bases.tshirt[0],
    description: "A timeless white crew-neck made from 100% combed cotton. The perfect blank canvas for your custom design.",
  },
  {
    name: "Oversized Black Tee",
    price: 449,
    type: "tshirt",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop",
    baseImage: bases.tshirt[1],
    description: "Relaxed oversized silhouette in heavyweight black cotton. Streetwear-ready and built for bold prints.",
  },
  {
    name: "V-Neck Premium Tee",
    price: 429,
    type: "tshirt",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop",
    baseImage: bases.tshirt[0],
    description: "Slim-fit V-neck with a soft hand feel. Great for text-based designs and minimalist artwork.",
  },
  {
    name: "Bio-Wash Graphic Tee",
    price: 499,
    type: "tshirt",
    image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&auto=format&fit=crop",
    baseImage: bases.tshirt[2],
    description: "Bio-washed for an ultra-soft vintage feel. Slightly faded tone that pairs perfectly with bold graphics.",
  },
  {
    name: "Athletic Dry-Fit Tee",
    price: 479,
    type: "tshirt",
    image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&auto=format&fit=crop",
    baseImage: bases.tshirt[0],
    description: "Moisture-wicking poly-blend construction. Ideal for sports teams, gym wear, and performance branding.",
  },
  {
    name: "Heavyweight Cotton Tee",
    price: 549,
    type: "tshirt",
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&auto=format&fit=crop",
    baseImage: bases.tshirt[1],
    description: "240 GSM heavyweight build that holds screen prints crisply. Structured fit with a premium look.",
  },
  {
    name: "Pocket Detail Tee",
    price: 419,
    type: "tshirt",
    image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&auto=format&fit=crop",
    baseImage: bases.tshirt[0],
    description: "Classic chest pocket detail in soft cotton. A subtle design touch for everyday casual wear.",
  },
  {
    name: "Relaxed Weekend Tee",
    price: 389,
    type: "tshirt",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop",
    baseImage: bases.tshirt[2],
    description: "Dropped shoulders and a relaxed cut for weekend vibes. Lightweight and breathable for all-day wear.",
  },

  // ── HOODIES (6) ───────────────────────────────────────────────────────────
  {
    name: "Fleece Pullover Hoodie",
    price: 849,
    type: "hoodie",
    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&auto=format&fit=crop",
    baseImage: bases.hoodie[1],
    description: "Warm brushed fleece interior with a kangaroo pocket. A staple for custom embroidery and print-on-demand.",
  },
  {
    name: "Zip-Up Cotton Hoodie",
    price: 899,
    type: "hoodie",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop",
    baseImage: bases.hoodie[0],
    description: "Full-zip hoodie in organic cotton blend. Layerable, versatile, and great for small chest prints.",
  },
  {
    name: "Oversized Urban Hoodie",
    price: 949,
    type: "hoodie",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop",
    baseImage: bases.hoodie[1],
    description: "Dropped-shoulder oversized hoodie for a strong street presence. Large front panel for statement graphics.",
  },
  {
    name: "Washed Vintage Hoodie",
    price: 999,
    type: "hoodie",
    image: "https://images.unsplash.com/photo-1578768079052-aa76e52ff0aa?w=600&auto=format&fit=crop",
    baseImage: bases.hoodie[1],
    description: "Enzyme-washed for a lived-in vintage look. Soft, worn-in texture that feels like your oldest favourite.",
  },
  {
    name: "Lightweight Summer Hoodie",
    price: 749,
    type: "hoodie",
    image: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&auto=format&fit=crop",
    baseImage: bases.hoodie[0],
    description: "Thin French terry construction for milder weather. The go-to hoodie when full fleece is too much.",
  },
  {
    name: "Athleisure Training Hoodie",
    price: 879,
    type: "hoodie",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop",
    baseImage: bases.hoodie[1],
    description: "Four-way stretch fabric blended for movement. Built for gyms, runs, and sports team customization.",
  },

  // ── SHIRTS (6) ────────────────────────────────────────────────────────────
  {
    name: "Oxford Cotton Shirt",
    price: 649,
    type: "shirt",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop",
    baseImage: bases.shirt[0],
    description: "Classic Oxford weave in 100% cotton. A polished base for corporate branding and monogram embroidery.",
  },
  {
    name: "Slim Fit Formal Shirt",
    price: 699,
    type: "shirt",
    image: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&auto=format&fit=crop",
    baseImage: bases.shirt[0],
    description: "Tailored slim cut with a spread collar. Ideal for event uniforms and professional custom branding.",
  },
  {
    name: "Linen Blend Summer Shirt",
    price: 749,
    type: "shirt",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop",
    baseImage: bases.shirt[0],
    description: "Breathable linen-cotton blend for warm weather. Relaxed fit with a clean look for resort and travel branding.",
  },
  {
    name: "Mandarin Collar Shirt",
    price: 679,
    type: "shirt",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop",
    baseImage: bases.shirt[0],
    description: "Modern Mandarin collar with a structured feel. A contemporary alternative for upscale custom uniforms.",
  },
  {
    name: "Casual Flannel Shirt",
    price: 729,
    type: "shirt",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&auto=format&fit=crop",
    baseImage: bases.shirt[0],
    description: "Soft brushed flannel in a relaxed cut. Works perfectly for autumn events and outdoor team wear.",
  },
  {
    name: "Printed Vacation Shirt",
    price: 599,
    type: "shirt",
    image: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&auto=format&fit=crop",
    baseImage: bases.shirt[0],
    description: "Short-sleeve button-up with a camp collar. The ultimate canvas for full-body custom all-over prints.",
  },
];

const seed = async () => {
  try {
    await Product.deleteMany({});
    const inserted = await Product.insertMany(products);
    console.log(`✅ Seeded ${inserted.length} products successfully`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seed();