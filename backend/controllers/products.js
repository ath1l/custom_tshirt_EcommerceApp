const Product = require('../models/Product');


module.exports.index = async (req, res) => {
  try {
    const products = await Product.find(); // Mongoose query
    res.json(products); // Return JSON
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports.show = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Product not found" });
  }
};


