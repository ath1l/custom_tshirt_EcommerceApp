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
      type: Object, // Fabric JSON
      required: true,
    },
    previewImage: {
      type: String, // base64 PNG
      required: true,
    },
  },

  quantity: {
    type: Number,
    default: 1,
  },

  totalPrice: Number,

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
