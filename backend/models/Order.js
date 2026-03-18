const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  customization: {
    designJSON: {
      type: Object,
      default: null,
    },
    previewImage: {
      type: String,
      required: true,
    },
    previewImages: {
      front: {
        type: String,
        default: '',
      },
      back: {
        type: String,
        default: '',
      },
    },
    material: {
      type: String,
      enum: ['Cotton', 'Cotton-Poly Blend', 'Polyester'],
      default: 'Cotton',
    },
  },
  quantity: {
    type: Number,
    default: 1,
  },
  totalPrice: Number,
  paymentId: {
    type: String,      // Razorpay payment_id e.g. "pay_ABC123"
    default: null,
  },
  status: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
