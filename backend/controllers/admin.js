const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');

const normalizeAssetPath = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  const normalized = trimmed.replace(/\\/g, '/');
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
};

const normalizeAssetList = (value) =>
  Array.isArray(value)
    ? value.map(normalizeAssetPath).filter(Boolean)
    : [];

const normalizeCategorySlug = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'username email')
      .populate('productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'delivered'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'username email')
      .populate('productId');

    res.json(populatedOrder);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

module.exports.addProduct = async (req, res) => {
  try {
    const { name, price, image, baseImage, backImage, galleryImages, isOutOfStock, description, type } = req.body;
    const normalizedType = normalizeCategorySlug(type);
    const category = await Category.findOne({ slug: normalizedType });
    if (!category) {
      return res.status(400).json({ message: 'Select a valid category' });
    }

    const product = new Product({
      name,
      price,
      image: normalizeAssetPath(image),
      baseImage: normalizeAssetPath(baseImage),
      backImage: normalizeAssetPath(backImage),
      galleryImages: normalizeAssetList(galleryImages),
      isOutOfStock: Boolean(isOutOfStock),
      description,
    });
    product.type = normalizedType;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product' });
  }
};

module.exports.editProduct = async (req, res) => {
  try {
    const { name, price, image, baseImage, backImage, galleryImages, isOutOfStock, description, type } = req.body;
    const normalizedType = normalizeCategorySlug(type);
    const category = await Category.findOne({ slug: normalizedType });
    if (!category) {
      return res.status(400).json({ message: 'Select a valid category' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.name = name;
    product.price = price;
    product.image = normalizeAssetPath(image);
    product.baseImage = normalizeAssetPath(baseImage);
    product.backImage = normalizeAssetPath(backImage);
    product.galleryImages = normalizeAssetList(galleryImages);
    product.isOutOfStock = Boolean(isOutOfStock);
    product.description = description;
    product.type = normalizedType;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to edit product' });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

module.exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

module.exports.addCategory = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const slug = normalizeCategorySlug(req.body.slug || name);
    const image = normalizeAssetPath(req.body.image);

    if (!name || !slug || !image) {
      return res.status(400).json({ message: 'Name, slug, and thumbnail are required' });
    }

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category slug already exists' });
    }

    const category = await Category.create({ name, slug, image });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add category' });
  }
};

module.exports.editCategory = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const slug = normalizeCategorySlug(req.body.slug || name);
    const image = normalizeAssetPath(req.body.image);

    if (!name || !slug || !image) {
      return res.status(400).json({ message: 'Name, slug, and thumbnail are required' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const duplicate = await Category.findOne({ slug, _id: { $ne: category._id } });
    if (duplicate) {
      return res.status(400).json({ message: 'Category slug already exists' });
    }

    const previousSlug = category.slug;
    category.name = name;
    category.slug = slug;
    category.image = image;
    await category.save();

    if (previousSlug !== slug) {
      await Product.updateMany({ type: previousSlug }, { $set: { type: slug } });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update category' });
  }
};

module.exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const productCount = await Product.countDocuments({ type: category.slug });
    if (productCount > 0) {
      return res.status(400).json({ message: 'Remove products from this category before deleting it' });
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category' });
  }
};
