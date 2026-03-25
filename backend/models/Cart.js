const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  designJSON: { type: Object, default:null },
  previewImage: { type: String, required: true },
  previewImages: {
    front: { type: String, default: '' },
    back: { type: String, default: '' },
  },
  material: {
    type: String,
    enum: ['Cotton', 'Cotton-Poly Blend', 'Polyester'],
    default: 'Cotton',
  },
  quantity: { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Cart', cartSchema);
