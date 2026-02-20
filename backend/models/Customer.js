const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },

    totalOrders: { type: Number, default: 0 },
    totalReservations: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },

    loyaltyPoints: { type: Number, default: 0 }, // simple: 1 point per order
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
