const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      default: "UPI",
    },
    status: {
      type: String,
      default: "Success",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
