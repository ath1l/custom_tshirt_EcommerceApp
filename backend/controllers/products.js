const Product = require('../models/Product');


 module.exports.index = async (req, res) => {
  try {
    const products = await Product.find(); // Mongoose query
    res.json(products); // Return JSON
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}
//old // module.exports.index = async (req, res) => {
//   const products = await Product.find();
//   res.render('products/index', { products });
// };

module.exports.show = async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render('products/show', { product });
};

