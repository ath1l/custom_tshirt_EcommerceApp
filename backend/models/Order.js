const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  customization: {
    color: String,
    size: String,
    text: String,
    image: String
  },

  quantity: {
    type: Number,
    default: 1
  },

  priceAtPurchase: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Order', orderSchema);
